import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import axios from 'axios';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    this.navigator = {} as Navigator;
    context.log('HTTP trigger function processed a request.');
    const pwd: string = req.query.p || (req.body && req.body.p);
    const code: string = context.bindingData.id;

    const response = await axios.get(
        `https://peer-server.blueforest-87d967c8.northeurope.azurecontainerapps.io/model/${code}?p=${pwd}`,
        {
            headers: {
                Accept: 'application/zip',
            },
        }
    );

    console.log('data', response);

    context.res = {
        headers: {
            'content-type': response.headers['content-type'],
            etag: response.headers.etag,
            date: response.headers.data,
        },
        isRaw: true,
        body: Buffer.from(response.data, 'utf8'),
    };
};

export default httpTrigger;
