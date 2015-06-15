/**
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    02/10/2015
 Author:     Chris Brame

 **/

var mongoose = require('mongoose');
var _ = require('underscore');

var COLLECTION = 'messages';

var messageSchema = mongoose.Schema({
    owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
    folder:     { type: Number, default: 0, required: true },
    unread:     { type: Boolean, default: true, required: true },
    from:       { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
    subject:    { type: String, required: true },
    date:       { type: Date, default: Date.now, required: true },
    message:    { type: String, required: true}
});

messageSchema.methods.updateUnread = function(unread, callback) {
    unread = _.isUndefined(unread) ? false : unread;

    this.model(COLLECTION).findOne({_id: this._id}, function(err, doc) {
        if (err) {
            return callback(err, doc);
        }

        doc.unread = unread;
        doc.save();

        callback(err, doc);
    });
};

messageSchema.methods.moveToFolder = function(folder, callback) {
    this.model(COLLECTION).findOne({_id: this._id }, function(err, doc) {
        if (err) return callback(err, null);

        doc.folder = folder;
        doc.save(function(err, d) {
             callback(err, d);
        });
    });
};

messageSchema.statics.getMessagesWithObject = function(obj, callback) {
    if (!_.isObject(obj)) {
        return callback("Invalid Object (Must be of type Object) - MessageSchema.GetMessagesWithObject()", null);
    }

    if (_.isUndefined(obj.owner) || _.isNull(obj.owner)) {
        return callback("Invalid Object Owner - MessageSchema.GetMessagesWithObject()", null);
    }

    var limit = (obj.limit == null ? 10 : obj.limit);
    var page = (obj.page == null ? 0 : obj.page);
    var folder = (obj.folder == null ? 0 : obj.folder);

    var q = this.model(COLLECTION).find({owner: obj.owner, folder: folder})
        .populate('owner')
        .populate('from')
        .sort('-date')
        .skip(page*limit)
        .limit(limit);

    return q.exec(callback);
};

messageSchema.statics.getUnreadInboxCount = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUnreadInbox()", null);
    }

    return this.model(COLLECTION).count({owner: oId, folder: 0, unread: true}, callback);
};

messageSchema.statics.getUserFolder = function(oId, folder, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUserFolder()", null);
    }
    if (_.isUndefined(folder)) {
        return callback("Invalid Folder - MessageSchema.GetUserFolder()", null);
    }

    var q = this.model(COLLECTION).find({owner: oId, folder: folder})
        .populate('owner')
        .populate('from')
        .sort({date: -1});

    return q.exec(callback);
};

messageSchema.statics.getUserInbox = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUserInbox()", null);
    }

    var q = this.model(COLLECTION).find({owner: oId, folder: 0})
        .populate('owner')
        .populate('from')
        .limit(50)
        .sort({'date': -1});

    return q.exec(callback);
};

messageSchema.statics.getUserSentBox = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUserSentBox()", null);
    }

    var q = this.model(COLLECTION).find({owner: oId, folder: 1})
        .populate('owner')
        .populate('from')
        .limit(50);

    return q.exec(callback);
};

messageSchema.statics.getUserTrashBox = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUserTrashBox()", null);
    }

    var q = this.model(COLLECTION).find({owner: oId, folder: 2})
        .populate('owner')
        .populate('from')
        .limit(50);

    return q.exec(callback);
};

messageSchema.statics.getMessageById = function(mId, callback) {
    if (_.isUndefined(mId)) {
        return callback("Invalid MessageId - MessageSchema.GetMessageById()", null);
    }

    var q = this.model(COLLECTION).findOne({_id: mId})
        .populate('owner')
        .populate('from');

    return q.exec(callback);

};

messageSchema.statics.getUserUnreadMessages = function(oId, callback) {
    if (_.isUndefined(oId)) {
        return callback("Invalid OwnerId - MessageSchema.GetUserUnreadMessages()", null);
    }

    var q = this.model(COLLECTION).find({owner: oId, folder: 0, unread: true})
        .populate('owner')
        .populate('from')
        .limit(50)
        .sort({'date': -1});

    return q.exec(callback);
};

messageSchema.statics.deleteMessage = function(mId, callback) {
    if (_.isUndefined(mId)) {
        return callback("Invalid MessageId - MessageSchema.DeleteMessage()", null);
    }

    var q = this.model(COLLECTION).remove({_id: mId});
    return q.exec(callback);
};

module.exports = mongoose.model(COLLECTION, messageSchema);