
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import setupAntd from './plugins/antd';

const app = createApp(App);
app.use(router);
setupAntd(app);
app.mount('#app');
