import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import { s3Client } from '../../api/awsClient';
import { FilesCollection } from 'meteor/ostrio:files';
import fs from 'fs';
import path from 'path';

const cfdomain = Meteor.settings.public.aws.domain;

export let UserFiles;

if (Meteor.isClient) {
  UserFiles = new FilesCollection({
    collectionName: 'userfiles',
    debug: false,
    throttle: false,
    allowClientCode: false
  });
}

if (Meteor.isServer) {
  bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });
  // TODO
  // const { updateMeteorSettings } = require('../../api/functions');
  UserFiles = new FilesCollection({
    collectionName: 'userfiles',
    debug: false,
    throttle: false,
    // storagePath: updateMeteorSettings(Meteor.settings.private.uploadsDir),
    storagePath: Meteor.settings.private.uploadsDir,
    allowClientCode: false,
    onBeforeUpload: function (file) {
      if (file.size <= 10485760) {
        return true;
      } else {
        return 'Please upload file with size equal or less than 10MB';
      }
    },
    onAfterUpload: function (fileRef) {
      if(fileRef.meta && fileRef.meta.dontMoveToS3) return;
      return copyUserfileToS3(fileRef, this);
    }
  });
  UserFiles.collection._ensureIndex({
    meta: 1
  })
}

export async function copyUserfileToS3(fileRef, instance) {
  return new Promise((resolve, reject) => {
    if (!fileRef.meta || !fileRef.meta.ownerId) throw "no ownerId given!";
    
    _.each(fileRef.versions, function (vRef, version) {
      let fileName = fileRef._id + "-" + version + "." + fileRef.extension;
    
      // set fileName for special cases such as Logo
      if(fileRef.meta.type) {
        if(fileRef.meta.type == 'logo') fileName = 'logo.' + fileRef.extension;
      }        

      const awsDir = path.join(Meteor.settings.public.aws.userFilesDir, `_user_${fileRef.meta.ownerId}`);      
      let filePath = path.join(awsDir, fileName);
      if(fileRef.meta.subDir) filePath = path.join(awsDir, fileRef.meta.subDir, fileName);

      console.log('S3 filePath', filePath);
      s3Client.putObject({
        StorageClass: 'STANDARD',
        Bucket: "orderlion.at",
        Key: filePath,
        Body: fs.createReadStream(vRef.path),
        ContentType: vRef.type,
      }, (error) => {
        bound(() => {
          
          if (error) {
            console.error("unable to upload:", err, err.stack);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["datetime"] = new Date();
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
                Meteor.call('cleanUpUserFiles', fileRef, filePath);
                return resolve( instance.collection.findOne(fileRef._id) );
              }
            });
          }

        });
      });      
    }); // end _.each
  });
}