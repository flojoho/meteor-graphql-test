import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import { s3Client } from '../../api/awsClient';
import { FilesCollection } from 'meteor/ostrio:files';
import stream from 'stream';
import fs from 'fs';
import path from 'path';
import async from 'async';
import mime from 'mime-types';

const cfdomain = Meteor.settings.public.aws.domain;

export let Images;

if (Meteor.isClient) {
  Images = new FilesCollection({
    collectionName: 'images',
    debug: false,
    throttle: false,
    allowClientCode: false
  });
}

if (Meteor.isServer) {
  // TODO
  // const { updateMeteorSettings } = require('../../api/functions');

  // https://github.com/VeliovGroup/Meteor-Files/wiki/Collection-Instances
  Meteor.startup(() => {
    Images.collection._ensureIndex({
      '_id': 1,
      'meta.supplier_id': 1,
      'meta.supplierIds': 1
    });
  });
  
  bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });

  function deUmlaut(fileRef){
    // is supplier specific - dont touch!
    if(fileRef.meta && (fileRef.meta.supplier_id || fileRef.meta.supplierIds)) return fileRef;
    // not sure if german - dont touch!
    if(!fileRef.name || fileRef.name.indexOf('-') == 1) return fileRef;
    
    let name = fileRef.name.toLowerCase().split('-');
    name[0] = name[0].replace(/ae/g, 'ä');
    name[0] = name[0].replace(/oe/g, 'ö');
    name[0] = name[0].replace(/ue/g, 'ü');
    fileRef.name = name.join('-');
    return fileRef;
  }
  
  Images = new FilesCollection({
    collectionName: 'images',
    debug: false,
    throttle: false,
    // storagePath: updateMeteorSettings(Meteor.settings.private.uploadsDir),
    storagePath: Meteor.settings.private.uploadsDir,
    allowClientCode: false,
    onBeforeUpload: function (file) {
      if (file.size <= 10485760 && /png|gif|jpg|jpeg/i.test(file.extension)) {
        return true;
      } else {
        return 'Please upload image, with size equal or less than 10MB';
      }
    },
    onAfterUpload: function(fileRef) {
      return copyItemimageToS3(fileRef, this);
    },
    interceptDownload: function(http, fileRef, version) {
      var path, ref, ref1, ref2;
      path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
      if (path) {
        Request({
          url: path,
          headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
        }).pipe(http.response);
        return true;
      } else {
        return false;
      }
    }
  });
}

export async function copyItemimageToS3(fileRef, instance) {
  return new Promise((resolve, reject) => {
    fileRef = deUmlaut(fileRef);
    let name = fileRef.name;
    // remove extension from name
    name = name.substring(0, name.lastIndexOf('.'));
    // update new image with new name without ext
    instance.collection.update({ _id: fileRef._id }, { $set: { name: name } });

    _.each(fileRef.versions, function(vRef, version) {
      let fileName = fileRef._id + "-" + version + "." + fileRef.extension;

      // prefixing images with timestamp for easier AWS S3 selection
      let tsString = moment().format('YYMMDD-HHmm');
      fileName = "_" + tsString + "_" + fileName;

      let filePath = Meteor.settings.public.aws.itemImagesDir  + "/" + fileName;
      let supplier = null;
      if(fileRef.meta && (fileRef.meta.supplier_id || fileRef.meta.supplierIds)) {
        let supplierId = fileRef.meta.supplier_id || fileRef.meta.supplierIds[0];
        supplier = Meteor.users.findOne({ _id: supplierId });
        let supplierDir = supplierId || '';
        if(supplier && supplier.internal && supplier.internal.s3ImagesDir) {
          supplierDir = supplier.internal.s3ImagesDir;
        }
        if(supplierDir.indexOf("_supplier_") == -1) {
          supplierDir = ("_supplier_" + supplierDir);
        }
        filePath = Meteor.settings.public.aws.itemImagesDir + "/" + supplierDir + "/" + fileName;
      }
      console.log('uploading ...', filePath);

      s3Client.putObject({
        StorageClass: 'STANDARD',
        Bucket: "orderlion.at",
        Key: filePath,
        Body: fs.createReadStream(vRef.path),
        ContentType: vRef.type,
      }, (err) => {
        bound(() => {
          if (err) {
            console.error("unable to upload:", err, err.stack);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["versions." + version + ".meta.pipeFrom"] = cfdomain + '/' + filePath;
            upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
            
            instance.collection.update({
              _id: fileRef._id
            }, upd, (error) => {
              if (error) {
                console.error(error);
                return reject(error);
              } else {
                instance.unlink(instance.collection.findOne(fileRef._id), version);
                Meteor.call('cleanUpItemImages', fileRef.meta.userId, fileRef, name, filePath);
                return resolve( instance.collection.findOne(fileRef._id) );
              }
            });
          }
        });
      });
    });
  });
}

// https://stackoverflow.com/questions/25757293/how-to-stream-read-directory-in-node-js
export async function uploadItemimagesDir(dirPath, supplierId, calledByUserId) {
  const files = fs.readdirSync(dirPath);
  return new Promise((resolve, reject) => {
    // TODO: maybe raise the 10 concurrent uploads?!
    async.eachLimit(files, 10, async function (filename, done) {
      const filePath = path.join(dirPath, filename);
      const buff = fs.readFileSync(filePath);

      const errors = [];
      if(filePath) {
        let meta = {
          userId: calledByUserId,
          supplier_id: supplierId
        };
        if(Array.isArray(supplierId)) {
          meta.supplierIds = supplierId;
          delete meta.supplier_id;
        }
        await Images.addFile(filePath, {
          fileName: path.parse(filePath).base,
          type: mime.lookup(filePath),
          userId: calledByUserId,
          meta
        }, async (err, fileRef) => {
          if(err) return errors.push(err);
          else {
            await copyItemimageToS3(fileRef, Images, 'itemimages');
            console.log('copyItemimageToS3() done');
            return done();
          }
        });
      }
    }, function(err) {
      if(err) reject(err);
      else resolve(true);
    });
  });
}