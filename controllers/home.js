var sidebar = require('../helpers/sidebar');
var ImageModel = require('../models').Image;

module.exports = {
    index: function(req, res) {
        //res.send('The home:index controller');
		var viewModel = {
				images: [ ]
		};
		
		console.log('We are here 1');
		
		//res.render('index', viewModel);
		/*sidebar(viewModel, function(viewModel) { 
			console.log('We are here 2');
			res.render('index', viewModel);
		});
		*/
		
		
		ImageModel.find({}, {}, { sort: { timestamp: -1 }},
		function(err, images) {
				if (err) { throw err; }
				
			console.log('We are here 3');
			viewModel.images = images;
			sidebar(viewModel, function(viewModel) {
				console.log('We are here 4');
				res.render('index', viewModel); 
				console.log('We are here 5');				
			});    
		});
    }
};
