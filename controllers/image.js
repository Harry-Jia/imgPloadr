var fs = require('fs');
var path = require('path');
var sidebar = require('../helpers/sidebar');
var Models = require('../models');
var md5 = require('MD5');

module.exports = {
    index: function(req, res) {
        //res.send('The image:index controller ' + req.params.image_id);
		//res.render('image');
		// declare our empty viewModel variable object:
		var viewModel = {
		  image: {},
		  comments: []    
		};  
		// find the image by searching the filename matching the url parameter:
		Models.Image.findOne({ filename: { $regex: req.params.image_id } },
			function(err, image) {
				if (err) { throw err; }
				if (image) {  
				// if the image was found, increment its views counter
				image.views = image.views + 1;    
				// save the image object to the viewModel:
				viewModel.image = image;    
				// save the model (since it has been updated):
				image.save();    
				
				// find any comments with the same image_id as the image:
				Models.Comment.find({ image_id: image._id},{},{ sort: { 'timestamp': 1 }},
					function(err, comments){    
					// save the comments collection to the viewModel:
					viewModel.comments = comments;    
					// build the sidebar sending along the viewModel:
					sidebar(viewModel, function(viewModel) {    
								// render the page view with its viewModel:
								res.render('image', viewModel);     
								}); 
							}    
					);  
				} else {    
					// if no image was found, simply go back to the homepage:
					res.redirect('/'); 
				}  
			}
		);
			
	},  


   create: function(req, res) {
        //res.send('The image:create POST controller');
		console.log('Started here 1');
		
		var saveImage = function() {  
			
			
			
			var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',  
			imgUrl = '';
			
			for(var i=0; i < 6; i+=1) {   
				imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			
			console.log('ImageUrl is: ' + imgUrl);
			
			/* Start new code: */  
			// search for an image with the same filename by performing a find:
			Models.Image.find({ filename: imgUrl }, function(err, images) {
				if (images.length> 0) {  
				// if a matching image was found, try again (start over):
					saveImage();        
				} else {
					console.log('Started here 3'); 
			/* end new code:*/
					console.log(req.files);
					console.log(req.files[0].filename);
					
					var tempPath = req.files[0].path;
					var ext = path.extname(req.files[0].originalname).toLowerCase();
					var targetPath = path.resolve('./public/upload/' + imgUrl + ext);
					if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') { 
						fs.rename(tempPath, targetPath, function(err) { 
						if (err) throw err;  
							//res.redirect('/images/' + imgUrl); 
							var newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            newImg.save(function(err, image) {
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/' + image.uniqueId);
                            });
						});
					} else { 
							fs.unlink(tempPath, function () {  
							if (err) throw err;   
								res.json(500, {error: 'Only image files are allowed.'}); 
							});
					}
						
			/* Start new code: */
				}    
			});
			/* End new code: */
		};
		
		saveImage();
    },
	
    like: function(req, res) {
        //res.send('The image:like POST controller');
		//res.json({likes: 1});
		Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    image.likes = image.likes + 1;
                    image.save(function(err) {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json({ likes: image.likes });
                        }
                    });
                }
            });
		
    },
    comment: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    var newComment = new Models.Comment(req.body);
                    console.log("DOOO")
                    console.log(req.body)
                    newComment.gravatar = md5(newComment.email);
                    newComment.image_id = image._id;
                    newComment.save(function(err, comment) {
                        if (err) { throw err; }

                        res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                    });
                } else {
                    res.redirect('/');
                }
            });
    },
	
	remove: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (err) { throw err; }

                fs.unlink(path.resolve('./public/upload/' + image.filename),
                    function(err) {
                        if (err) { throw err; }

                        Models.Comment.remove({ image_id: image._id},
                            function(err) {
                                image.remove(function(err) {
                                    if (!err) {
                                        res.json(true);
                                    } else {
                                        res.json(false);
                                    }
                                });
                        });
                });
            });
    }
};
