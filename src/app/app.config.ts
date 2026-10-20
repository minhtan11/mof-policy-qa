import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    // Chuyển cảnh chỉ khi ĐỔI TRANG (route khác). Chỉ đổi query/fragment trên cùng trang (lọc, phân trang, đổi kiểu xem)
    // → bỏ chuyển cảnh toàn trang (trước đây gây nháy). Cuộn lên đầu cũng chỉ khi đổi trang — xem App.
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (from.firstChild?.routeConfig === to.firstChild?.routeConfig) {
            transition.skipTransition();
          }
        },
      }),
    ),
  ],
};
