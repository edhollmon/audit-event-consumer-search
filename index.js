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
const esAuth = process.env.ELASTICSEARCH_API_KEY
  ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
  : undefined;

const node = process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200';
const client = new Client({
  node,
  auth: esAuth
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
    await client.indices.refresh({ index })
    
  },
})