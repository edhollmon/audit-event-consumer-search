import { Kafka } from 'kafkajs';
import { Client } from '@elastic/elasticsearch';
import 'dotenv/config';

const clientId = 'audit-event-consumer-search'
const brokers = [process.env.KAFKA_BROKER || 'kafka:9092' || 'localhost:9092']
const groupId = 'audit-event-search';
const topic = 'audit-event-topic';

// Kafka Setup
const kafka = new Kafka({
  clientId,
  brokers,
})

const consumer = kafka.consumer({
    groupId
})

await consumer.connect()
await consumer.subscribe({ topic, fromBeginning: true })


// Elasticsearch setup
const node = 'http://localhost:9200';
const client = new Client({
  node,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  }
})
const index = 'audit-events'
// await client.indices.create({ index })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString())
    // log event
    console.log("Event consumed") 
    console.log(event)



    // Send to search engine
    const uuid = crypto.randomUUID();
    await client.index({
        index,
        id: uuid,
        document: {
           ...event
        },
    })
    
  },
})