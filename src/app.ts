import { IKafkaConsumerService } from './interfaces/IKafkaConsumerService';
import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as ServiceProvider from './services/ServiceProvider';
import express from 'express';
import path from 'path';
import { useExpressServer } from 'routing-controllers';

export const baseDir = __dirname;

(async () => {
    useContainer(Container);
    const app = express();
    // const app = createExpressServer({
    //     controllers: [baseDir + '//controllers/*{.js,.ts}'],
    //     // middlewares: [baseDir + "/modules/**/middlewares/*{.js,.ts}"]
    // });
    useExpressServer(app, {
        // register created express server in routing-controllers
        controllers: [baseDir + '//controllers/*{.js,.ts}'],
    });
    app.use(express.static(path.join(baseDir, 'public')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'websocket-test.html'));
    });

    // Reister Services
    await ServiceProvider.createServiceContainers();

    const consumerEnabledMode: boolean = (process.env.CONSUMER_ENABLED as string) === 'true' ? true : false;
    console.log('Consumer Enabled: ', consumerEnabledMode);
    if (consumerEnabledMode) {
        const consumerService: IKafkaConsumerService = Container.get('KafkaConsumerService');
        consumerService.startConsuming();
    }

    const port: number = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})();
