export const handler = (event: any, context: any) => {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    context.done(null, event);
};