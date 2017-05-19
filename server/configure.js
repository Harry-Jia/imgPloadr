var path = require('path'), 
   routes = require('./routes'), 
   exphbs = require('express-handlebars'), 
   express = require('express'),   
   bodyParser = require('body-parser'), 
   cookieParser = require('cookie-parser'), 
   morgan = require('morgan'),  
   methodOverride = require('method-override'), 
   errorHandler = require('errorhandler'),
   moment = require('moment'),
   multer = require('multer'),
   fs = require('fs');
   
module.exports = function(app)  {
	
	app.engine('handlebars', exphbs.create({ 
		defaultLayout: 'main',    
		layoutsDir: app.get('views') + '/layouts',   
		partialsDir: [app.get('views') + '/partials'],
		helpers: {     
			timeago: function(timestamp) { 
				return moment(timestamp).startOf('minute').fromNow(); 
			} 
		}
	}).engine);
	app.set('view engine', 'handlebars');

	
	app.use(morgan('dev')); 
	app.use(bodyParser());
	//app.use(bodyParser({
	//	uploadDir:path.join(__dirname, 'public/upload/temp') 
	//}));
	app.use(multer({ dest: path.join(__dirname, 'public/upload/temp')}).any());
	//app.use(multer({ dest: path.join(__dirname, 'public/upload/temp')}).single('file'));
	
	//app.use(bodyParser.urlencoded({'extended':true})); 
	//app.use(bodyParser.json()); 
	app.use(methodOverride()); 
	app.use(cookieParser('some-secret-value-here'));  
	routes.initialize(app);//moving the routes to routes folder. 
	
	// Ensure the temporary upload folders exist 
	if (!fs.existsSync(path.join(__dirname, '../public/upload/temp'))) {
		fs.mkdir(path.join(__dirname, '../public/upload'), 	function(err){            
			if (err) console.log(err); 
			
			fs.mkdir(path.join(__dirname, '../public/upload/temp'), function(err){ 
				if (err) console.log(err);              
			});       
		});
	}
	
	app.use('/public/', express.static(path.join(__dirname, '../public')));
	
	if ('development' === app.get('env')) {  
		app.use(errorHandler());
	} 
	
	return app;
};

