import { QueryBuilder } from '../../../helpers/query-builder';
import { User } from '../../../common/interface';

export const handler = async (event: any, context: any) => {
    let id = event.request.userAttributes.sub;

    await new QueryBuilder<User>()
        .table(process.env.table ?? '')
        .where({
            id: id,
        })
        .update({
            lastLogin: Date.now()
        });

    context.done(null, event);
};
