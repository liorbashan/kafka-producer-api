# kafka-app
A Kafka application for handling producing via a REST API and consuming written in node.js and typescipt using kafka-node and routing-controllers packages

## Get Started
type docker-compose up will create 3 containers:
1. Kafka Zookeeper
2. Kafka Broker
3. Application

app configuration can be set in docker-compose yaml file

## Producer API
producer endpoint - http://localhost:3000/api/produce-message
produce request payload:
```javascript
{
    "topicName": "lior.test",
    "message": [
        {
            "foo": "bar"
        },
        {
            "1": "ONE"
        },
        {
            "2": "TWO"
        },
        {
            "3": "THREE"
        },
        {
            "4": "FOUR"
        }
    ],
    "key": "mykey"
}
```
