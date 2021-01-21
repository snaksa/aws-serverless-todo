import BaseHandler from '../../../common/base-handler';
import { QueryBuilder } from '../../../helpers/query-builder';

interface CompletedEventData {
    notifications: { id: string; outputUri: string; }[],
};

class CompletedHandler extends BaseHandler {
    input: CompletedEventData;

    parseEvent(event: any) {
        this.input = {
            notifications: []
        };

        event.Records.forEach((element: any) => {
            const message = JSON.parse(element.Sns.Message);
            this.input.notifications.push({
                id: message.taskId,
                outputUri: message.outputUri
            });
        });
    }

    async run(): Promise<any> {
        for (const notification of this.input.notifications) {
            const update = await new QueryBuilder<PollyProcess>()
                .table(process.env.table ?? '')
                .where({
                    id: notification.id
                })
                .update({
                    completedDate: Date.now(),
                    operationStatus: 'completed',
                    fileUrl: notification.outputUri
                });
        }

        return {
            message: 'finish'
        };
    }
}

export const handler = new CompletedHandler().create();
