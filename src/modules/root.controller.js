export const RootController = {
  async showMainPage(request, reply) {
    const logger = request.log.child({
      component: 'RootController',
      method: 'showMainPage',
    });
    logger.info('Display main page');
    const flash = reply.flash() || {};
    const isAuthenticated = Boolean(request.session.get('userId'));

    return reply.view('index', { flash, isAuthenticated });
  },
};

export function getStatusControllerInfo() {
  return {
    name: 'RootController',
    description: 'Controller for handling main page',
  };
}
