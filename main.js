window.app = {};

window.addEventListener('load', () => {
  const appComponent = new app.AppComponent();
  
  appComponent.render('#root');
});

