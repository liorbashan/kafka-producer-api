import { KafkaService } from './services/KafkaService';
import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

export const baseDir = __dirname;

(async () => {
    useContainer(Container);
    const app = createExpressServer({
        controllers: [baseDir + '//controllers/*{.js,.ts}'],
        // middlewares: [baseDir + "/modules/**/middlewares/*{.js,.ts}"]
    });
    Container.get(KafkaService);
    const port: number = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})();
