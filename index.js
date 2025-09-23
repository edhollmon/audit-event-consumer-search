import { Kafka } from 'kafkajs';




const clientId = 'audit-event-consumer-search'
const brokers = ['localhost:9092']
const groupId = 'audit-event-search';
const topic = 'audit-event-topic';

const kafka = new Kafka({
  clientId,
  brokers,
})

const consumer = kafka.consumer({
    groupId
})

await consumer.connect()
await consumer.subscribe({ topic, fromBeginning: true })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      value: message.value.toString(),
    })
  },
})