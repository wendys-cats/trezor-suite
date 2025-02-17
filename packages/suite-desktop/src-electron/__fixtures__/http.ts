export default [
    {
        method: 'GET',
        path: '/oauth?code=meow',
        result: {
            emit: ['oauth/code', 'meow'],
            response: {
                status: 200,
            },
        },
    },
    {
        method: 'GET',
        path: '/oauth?foo=moo',
        result: {
            response: {
                status: 200,
            },
        },
    },
];
