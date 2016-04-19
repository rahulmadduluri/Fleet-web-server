var models = require('../models');
var LIMIT = 10;
//var ObjectId = require('mongoose').Schema.Types.ObjectId;
//GET a specific video
exports.getVideo = function(req, res) {
	req.models.Video.findById(req.params.uuid, function(err, video) {
		if (err) throw err;
		if (!video) {
			res.json({ success: false, message: 'Get failed! Video not found.' });
		}
		else {
			res.json({
				success: true,
				message: 'Video successfully found!',
				video: video
			});
		}
	});
}

//POST add video
exports.addVideo = function(req, res) {
	req.models.User.findById(req.body.author, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Could not find author of video.' });
		}
		else {
			var newVideo = new models.Video();
			newVideo.title = req.body.title;
			newVideo.hashtags = req.body.hashtags;
			newVideo.duration = req.body.duration;
			newVideo.video_focuses = req.body.video_focuses;
			newVideo.thumbnail = req.body.thumbnail;
			newVideo.num_upvotes = 0;
			newVideo.num_views = 0;
			newVideo.rating = 0;
			newVideo.author = user._id; // reference to the creator of the video
			newVideo.s3 = req.body.s3;
			newVideo._id = uuident.v4();
			if (newVideo.title && newVideo.hashtags && newVideo.duration && newVideo.video_focuses
				&& newVideo.thumbnail && newVideo.s3 && newVideo._id) {
				newVideo.save(function(err){
					if (err) throw err;
					else{
						user.uploaded_videos_arr.push(newVideo);
						user.save(function(err){
							if(err) throw err;
							else{
								res.json({
									success: true,
									message: 'Video successfully created!',
								});
							}
						});
					}
				});
			}
			else {
				res.json({
					success: false,
					message: 'Failed to generate new video. At least one field is missing',
				});
			}
		}
	});
};

//PUT update video
exports.updateVideo = function(req, res) {
	req.models.Video.findById(req.params.uuid, function(err, video) {
		if (err) throw err;
		if (!video) {
			res.json({ success: false, message: 'Updated failed! Video not found.' });
		}
		else {
			//check if author
			if(req.body.title) {
				video.title = req.body.title;
			}
			if(req.body.hashtags) {
				video.hashtags = req.body.hashtags;
			}
			if (req.body.video_focuses) {
				video.video_focuses = req.body.video_focuses;
			}
			if(req.body.userchanged.upvoted) {
				video.num_upvotes = video.num_upvotes + 1;
				video.rating = (video.num_upvotes * .5) + (video.num_views * .5);
			} 
			video.save(function (err){
				if (err) throw err;
				res.json({
					success: true,
					message: 'Video successfully found and updated!',
				});
			});
		}
	});
};

//DELETE delete video
exports.deleteVideo = function(req, res) {
	req.models.Video.findByIdAndRemove(req.params.uuid, function(err, video){
		if (err) throw err;
		if (!video) {
			res.json({ success: false, message: 'Delete failed! Video not found.' });
		}
		else {
			res.json({
				success: true,
				message: 'Video successfully deleted!',
			});
		}
	});
};

//GET hot video list
exports.getHotVideos = function(req, res) {
	var _limit = req.query.limit || LIMIT;

	req.models.Video.find({}, null, {
		if (err) throw err;
		limit: _limit,
		sort: {
			'rating': -1
		}
	}, function(err, docs) {
		if(err || !docs) throw err;
		var videos = [];
		docs.forEach(function(doc, i, list){
			var item = doc.toObject();
			videos.push(item);
		});
		var body = {};
		body.limit = _limit;
		body.videos = videos;
		req.models.Video.count({}, function(err, total) {
			if (err) throw err;
			body.total = total;
			res.status(200).json(body);
		});
	});
	
};

//GET new video list
exports.getNewVideos = function(req, res) {
	var _limit = req.query.limit || LIMIT;

	req.models.Video.find({}, null, {
		if (err) throw err;
		limit: _limit,
		sort: {
			'created_at': -1
		}
	}, function(err, docs) {
		if(err || !docs) throw err;
		var videos = [];
		docs.forEach(function(doc, i, list){
			var item = doc.toObject();
			videos.push(item);
		});
		var body = {};
		body.limit = _limit;
		body.videos = videos;
		req.models.Video.count({}, function(err, total) {
			if (err) throw err;
			body.total = total;
			res.status(200).json(body);
		});
	});
	
};

