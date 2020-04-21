'use strict'

///EMAIL FUNCTIONS
const aws = require("aws-sdk");
/// Please enter your key and secret key
aws.config.update({
    accessKeyId: '*',
    secretAccessKey: '*',
    region: 'eu-west-1'
  });

const ses = new aws.SES({ apiVersion: "2010-12-01" });


module.exports.handlePlacedOrders = async ordersPlaced => {
    var ordersPlacedPromises = [];
       
   

     for(let order of ordersPlaced) {

        const temp =  notifyCakeProducerByEmail1(order);

        ordersPlacedPromises.push(temp);

     }

    return  Promise.all(ordersPlacedPromises);



}


 function  notifyCakeProducerByEmail1(order) { 

  //  console.log("order",order)

  console.log("orders",order)

    const params = {
        Destination: {
            ToAddresses: ["uktoturkey@gmail.com"]
        },
        Message: {
            Body: {
                Text: { Data: JSON.stringify(order)
                    
                }
                
            },
            
            Subject: { Data: "Cooker Notify"
                
            }
        },
        Source: "no-reply@uktoturkey.com"
    };

    
      return ses.sendEmail(params).promise().then(r=>r)



   
 }
