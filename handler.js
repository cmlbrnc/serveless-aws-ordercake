'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');
const deliveryManager = require('./deliveryManager')

function createResponse(statusCode , message) {
  const response = {
    statusCode: statusCode, 
    body: JSON.stringify(message) 
    };
  return response;
}

module.exports.createOrder = async (event) => {

 const body = JSON.parse(event.body)

 const order = orderManager.createOrder(body);

 return orderManager.placeNewOrder(order).then(()=>{
   return createResponse(200,order);
 }).catch((error)=>{
   return createResponse(400,error);
 })




};

module.exports.orderFulfillment = async (event) => {
  const body = JSON.parse(event.body);
  const orderId= body.orderId;
  const fullfillmentId= body.fullfillmentId;


  return orderManager.fulfillOrder(orderId,fullfillmentId).then(()=> {
    return createResponse(200,`Order with orderId:${orderId} was sent to delivery`)
  }).catch(error => {

    return createResponse(400,error);

 });
}

module.exports.notifyExternalPArties = async (event) => {
    const records = kinesisHelper.getRecords(event);

 

    const cakeProducerPromise = getCakeProducerPromise(records);
    const deliveryPromise = getDeliveryPromise(records);

    return Promise.all([cakeProducerPromise,deliveryPromise]).then((r)=> {
       console.log(r);
      return 'eventything went well'
    })


} 

module.exports.notifyDeliveryCompany = async (event) => {
   // Some Http call!!

   console.log('Lets imagine that we call the delivery company endpoint')
  return 'done';
}

 function getCakeProducerPromise (records) {

  const ordersPlaced = records.filter(r=>r.eventType === 'order_placed');
  if(ordersPlaced.lenght <= 0) {
    return null;
   }
 return  cakeProducerManager.handlePlacedOrders(ordersPlaced);
}

 function getDeliveryPromise(records) {

  
  const ordersPlaced = records.filter(r=>r.eventType === 'order_fulfilled');
     console.log("Order placed" ,ordersPlaced)
  if(ordersPlaced.lenght <= 0) {
    return null;
   }
  return deliveryManager.deliveryOrder(ordersPlaced);

}


