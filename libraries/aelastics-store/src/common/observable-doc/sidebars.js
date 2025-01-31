
module.exports = {
  docs: [
    'introduction',
    'getting-started',
    {
      type: 'category',
      label: 'Guides',
      items: ['guides/observable-object', 'guides/observable-array', 'guides/observable-map', 'guides/observable-set'],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/api-overview', 'api/api-observable-object', 'api/api-observable-array', 'api/api-observable-map', 'api/api-observable-set'],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: ['advanced/extending-handlers', 'advanced/performance', 'advanced/integration'],
    },
  ],
};
