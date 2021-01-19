import { QueryBuilder } from '../../../helpers/query-builder';

export const handler = async (event: any, context: any) => {
    let id = event.request.userAttributes.sub;

    await new QueryBuilder()
        .table(process.env.table ?? '')
        .where({
            "id": id,
        })
        .update({
            'lastLogin': Date.now().toString()
        });

    context.done(null, event);
};
