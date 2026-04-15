/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/exercises` | `/(tabs)/rehab` | `/(tabs)/routines` | `/_sitemap` | `/exercise-detail` | `/exercises` | `/new-exercise` | `/rehab` | `/rehab-active` | `/rehab-bloque` | `/rehab-finish` | `/routine-detail` | `/routines` | `/workout` | `/workout-finish`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
