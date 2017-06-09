var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const axios = require('axios')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

//This is the route the API will call
app.post('/new-message', function(req, res) {
  const{message} = req.body
  var fileId = message.photo[0].file_id
  console.log('fileId : ' + fileId );

  var requestObject =
  {
  "requests":
    [
    {
      "image": {
       "source": {
       }
     },
        "features":[
          {
          "type":"LABEL_DETECTION"
          }
        ]
      }
    ]
  };
  var imagePath;
  var filePath;
  var visionApi = 'https://vision.googleapis.com/v1/images:annotate?key=API_KEY';
  var desc;
  axios.post('https://api.telegram.org/botAPI_KEY/getFile',
  {file_id:fileId})
  .then(response => {
     prettyJSON(response.data);
    filePath = 'https://api.telegram.org/file/botAPI_KEY/' + response.data.result.file_path;
    console.log('filepath : ' + filePath);
    requestObject.requests[0].image.source.imageUri = filePath;
    return axios.post(visionApi,requestObject);
  }).then(response => {
    prettyJSON(response.data);
    desc =  response.data.responses[0].labelAnnotations[0].description;
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=sn&dt=t&q=' + desc
    return axios.post(url);
  })
  .then(response => {
    prettyJSON(response.data);
    var translation = response.data[0][0][0]
    return   axios.post('https://api.telegram.org/botAPI_KEY/sendMessage', {
      chat_id: message.chat.id,
      text  : translation
    });
   })
   .then(response => {
     // We get here if the message was successfully posted
       console.log('Message posted')
       res.end('ok')
   })
  .catch(err => {
    // ...and here if it was not
    console.log('Error :', err)
    res.end('Error :' + err)
  })
});

function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}


// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!');
});
