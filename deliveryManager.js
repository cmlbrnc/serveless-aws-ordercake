'use strict'

const orderManager = require('./orderManager');

///EMAIL FUNCTIONS
const aws = require("aws-sdk");




const sqs = new aws.SQS({ 

    region: 'us-east-1'
});

const DELIVERY_COMPANY_QUEUE = process.env.deliveryCompanyQueue;

module.exports.deliveryOrder = async  ordersFullfilled => {
   const ordersFullfilledPromises = [];
     console.log("deliver order", ordersFullfilled)
   for (let order of ordersFullfilled) {
       const temp = orderManager.updateOrderForDelivery(order.orderId).then((updatedOrder)=>{
          return orderManager.saveOrder(updatedOrder).then(()=>{
               return notifyDeliveryCompany(updatedOrder);
           });
       });

       ordersFullfilledPromises.push(temp);
   }

   return Promise.all(ordersFullfilledPromises);
}

function notifyDeliveryCompany (order) {
    const params =  {
        MessageBody : JSON.stringify(order),
        QueueUrl : DELIVERY_COMPANY_QUEUE
    };

    console.log(order)

    return sqs.sendMessage(params).promise();

    
}