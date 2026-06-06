---
name: ruoyi-cloud-vue3-admin
description: Work on the RuoYi-Cloud-Vue3 admin frontend built with Vue 3, Vite, Element Plus, Pinia, Vue Router 4, Axios, and RuoYi-Cloud permission APIs. Use when modifying login, dynamic routes, menus, button permissions, system pages, API modules, layout, themes, or frontend-backend permission integration.
user-invocable: true
---

# RuoYi-Cloud-Vue3 Admin Frontend

Use this skill when working in `RuoYi-Cloud-Vue3` or when the user asks about the Vue 3 frontend for RuoYi-Cloud.

## When to use

- The task touches Vue 3 views, Element Plus UI, Vite config, Pinia stores, Vue Router 4 routes, Axios requests, SCSS styles, icons, or admin layout.
- The task involves RuoYi-Cloud frontend permission behavior: login, token, current user info, dynamic menus, button permissions, role checks, lock screen, or route guards.
- The task asks to connect a new page to backend APIs, add system-management pages, adjust menu visibility, or verify frontend/backend permission consistency.
- The task mentions `RuoYi-Cloud-Vue3`, `Element Plus`, `Pinia`, `getRouters`, `v-hasPermi`, `v-hasRole`, `VITE_APP_BASE_API`, or admin dashboard pages.

## Project baseline

Official documentation describes RuoYi-Cloud as a Spring Boot + Spring Cloud & Alibaba microservice permission management system. Its frontend variants can be mixed with backend branches:

| Frontend | Stack | Role |
| --- | --- | --- |
| `RuoYi-Cloud` | Vue 2, JavaScript, Vue CLI, Element UI, Vuex, Vue Router 3 | Classic frontend. |
| `RuoYi-Cloud-Vue3` | Vue 3, JavaScript, Vite, Element Plus, Pinia, Vue Router 4 | Officially promoted active frontend. |
| `RuoYi-Cloud-Vue3-TypeScript` | Vue 3, TypeScript, Vite, Element Plus, Pinia, Vue Router 4 | Typed collaboration variant. |

Current project stack detected from `package.json`:

- Vue `3.5.x`
- Vite `6.x`
- Element Plus `2.13.x`
- Pinia `3.x`
- Vue Router `4.6.x`
- Axios `1.13.x`
- ECharts, VueUse, Vue Quill, File Saver, JS Encrypt, NProgress
- SCSS via `sass-embedded`

## Frontend module map

| Boundary | Typical path | Responsibility |
| --- | --- | --- |
| App bootstrap | `src/main.js`, `src/App.vue` | Register app, plugins, global directives, global styles. |
| Route guard | `src/permission.js` | Token checks, whitelist, lock screen, user info loading, dynamic route registration. |
| Static router | `src/router/index.js` | Constant routes, dynamic route declarations, error pages, layout entry. |
| Dynamic route store | `src/store/modules/permission.js` | Calls backend `getRouters`, converts backend route records to Vue components, writes sidebar/topbar/default routes. |
| User store | `src/store/modules/user.js` | Login, token persistence, current user info, roles, permissions, logout. |
| API layer | `src/api/**` | Thin request modules aligned to backend route namespaces. |
| Request client | `src/utils/request.js` | Axios base URL, Bearer token, repeat-submit guard, errors, downloads. |
| Permission directives | `src/directive/permission/*` | `v-hasPermi` and `v-hasRole` DOM-level visibility. |
| Permission helpers | `src/plugins/auth.js`, `src/utils/permission.js` | Role/permission helper checks. |
| Layout | `src/layout/**` | Sidebar, topbar, tags view, app main, notice, settings, iframe handling. |
| System pages | `src/views/system/**` | User, role, menu, dept, post, dict, config, notice, logs. |
| Monitor/tool pages | `src/views/monitor/**`, `src/views/tool/**` | Jobs, online users, form builder. |
| Styling/assets | `src/assets/styles/**`, `src/assets/icons/**` | SCSS, variables, sidebar, RuoYi styles, SVG icon registry. |

## Permission and routing flow

Use this chain when modifying permissions or page access:

1. User submits login form.
2. `src/store/modules/user.js` calls `src/api/login.js`.
3. Backend returns `access_token`; frontend stores it through `src/utils/auth.js`.
4. `src/permission.js` route guard checks token and whitelist.
5. If roles are empty, frontend calls current-user info API.
6. User store saves `roles` and `permissions`.
7. Permission store calls backend menu route API through `getRouters`.
8. Backend route records are converted to Vue components by `filterAsyncRouter` and `loadView`.
9. `router.addRoute` registers dynamic routes.
10. Sidebar, topbar, tags view, and default routes consume the generated route state.
11. Buttons/actions use `v-hasPermi` or helper methods against `permissions`.
12. Backend still enforces real authorization; frontend permission checks are only visibility and navigation control.

Do not treat hidden buttons as authorization. Backend permission strings must still match controller permissions.

## API conventions

Keep frontend API modules thin and aligned with backend namespaces:

| Frontend path | Backend area | Examples |
| --- | --- | --- |
| `src/api/login.js` | Auth/user session | login, logout, getInfo, captcha. |
| `src/api/menu.js` | Dynamic routes | `getRouters`. |
| `src/api/system/user.js` | User management | list, detail, add, edit, delete, export, import, reset password, status. |
| `src/api/system/role.js` | Role and data scope | role CRUD, data scope, auth users, role menu/dept tree. |
| `src/api/system/menu.js` | Menu/button permissions | menu list/tree, add, edit, delete, sort. |
| `src/api/system/dept.js` | Department tree | dept CRUD and tree selection. |
| `src/api/system/dict/**` | Dictionary | dict type/data CRUD and cache refresh. |
| `src/api/system/config.js` | Parameters | config CRUD and config key lookup. |
| `src/api/system/notice.js` | Notices | notice CRUD, top list, mark read, read users. |
| `src/api/system/*log*.js` | Logs | operation logs and login logs. |
| `src/api/monitor/**` | Monitor | online users, scheduled jobs, job logs. |

When adding an API module:

1. Match backend URL namespace and permission strings.
2. Use the shared request client from `src/utils/request.js`.
3. Keep request functions small and named by user-facing action.
4. Do not create a second Axios instance unless the task explicitly requires a different backend or auth model.
5. For downloads/exports, use the shared download flow instead of ad-hoc blob handling.

## Page and menu development workflow

1. Confirm whether the page is backend-driven menu route or static frontend route.
2. If backend-driven:
   - Add or update backend menu metadata and permission strings.
   - Ensure `component` matches `src/views/**` path without `.vue`.
   - Ensure route path, name, hidden/cache metadata, and icon match sidebar expectations.
3. Create or update the Vue page under `src/views/**`.
4. Create or update API module under `src/api/**`.
5. Use Element Plus components consistent with existing system pages.
6. Use existing table/form/query/reset/modal/download patterns before inventing new state shape.
7. Protect row actions and toolbar buttons with `v-hasPermi`.
8. Confirm the same permission string exists in backend menu/button records and backend API annotations.
9. Verify login → getInfo → getRouters → route registration → page rendering → button visibility → backend request.

## UI and styling rules

- Prefer existing RuoYi page structure: search form, operation toolbar, table, pagination, add/edit dialog, import/export where relevant.
- Use Element Plus and existing utility plugins rather than introducing new UI libraries.
- Use `src/assets/styles/variables.module.scss`, `sidebar.scss`, `ruoyi.scss`, and existing layout styles before adding global CSS.
- Keep SVG icons under `src/assets/icons/svg` and confirm icon names match backend menu icon metadata.
- Respect existing admin density and table-heavy UX; do not redesign system pages into unrelated visual styles unless explicitly requested.
- For iframe/inner-link routes, preserve `InnerLink` and layout conventions.

## Frontend documentation coverage map

Use this section to route official documentation topics into concrete Vue3 admin frontend work.

| Documentation area | Vue3 frontend coverage | Primary scope |
| --- | --- | --- |
| Introduction | RuoYi-Cloud frontend variant and backend pairing. | `package.json`, official frontend version table, backend API behavior. |
| Quick start | Start/build/preview and locate UI entry points. | `npm run dev`, `npm run build:prod`, `vite.config.js`, `.env.*`. |
| Environment deployment | Node/Vite environment, backend API base URL, proxy/build mode. | `.env.development`, `.env.production`, `.env.staging`, `vite.config.js`. |
| Project introduction | Frontend module map and permission/routing flow. | `src/permission.js`, `src/router`, `src/store`, `src/api`, `src/views`. |
| Backend manual | Mirrors backend system modules as Vue pages and API modules. | `src/views/system/**`, `src/api/system/**`, button permissions. |
| Frontend manual | Login, route guard, dynamic route conversion, layout, tags view, Pinia, Axios. | `src/permission.js`, `src/store/modules/*`, `src/layout/**`, `src/utils/request.js`. |
| Component docs | RuoYi admin components and Element Plus usage patterns. | `src/components/**`, `src/plugins/**`, `src/assets/styles/**`. |
| Project extension | Add pages, routes, API modules, menus, icons, and permission buttons. | `src/views/**`, `src/api/**`, backend menu metadata, icon registry. |
| Video tutorials | Use only as reference; implement from current repo conventions. | Current Vue files and runtime behavior. |
| Update log | Compare package versions, route/API payloads, Element Plus/Vite behavior. | `package.json`, lockfile, `vite.config.js`, backend branch pairing. |
| Microservices | Frontend observes microservices through gateway-facing APIs. | `VITE_APP_BASE_API`, Axios, system/monitor/tool APIs. |
| Other | Classify as UI, routing, permission, request, build, or deployment. | Smallest matching frontend boundary. |

## Environment and build workflow

### Official documentation subitem index

Use this index to avoid stopping at page-level coverage. When a task names one of these official subitems, route it to the matching Vue3 frontend boundary first.

| Official page | Subitems to consider | Vue3 frontend handling |
| --- | --- | --- |
| Quick start | Project introduction, major features, technology selection, built-in features. | Confirm current Vue3/Vite/Element Plus/Pinia stack and paired backend permission model. |
| Environment deployment | Preparation, running system, backend run, frontend run, system deployment, backend deployment, frontend deployment, environment variables, Nginx, Tomcat, FAQ. | Check `.env.*`, `VITE_APP_BASE_API`, Vite proxy/base path, build output, static hosting and API proxy. |
| Project introduction | File structure, backend structure, frontend structure, core technologies, backend technologies, Spring Boot, Spring Cloud, Spring Security, frontend technologies. | Map frontend work to bootstrap, route guard, stores, API modules, layout, system views, monitor/tool views. |
| Backend manual | Pagination, frontend invocation, backend logic, import/export, annotation parameters, export flow, import flow, custom title, custom data handler, visible columns, hidden columns, multiple object collections, child lists, upload/download, upload flow, download flow, permission annotations, `@RequiresRoles`, `@RequiresPermissions`, programmatic permission checks, transaction management, exception handling, parameter validation, data masking, system logs, data permissions, multi-data-source, scheduled jobs, system interface, internationalization, backend i18n flow, frontend i18n flow, new submodule. | Mirror backend behavior through query forms, API modules, tables, import/export dialogs, upload/download components, `v-hasPermi`, `v-hasRole`, error display and route/menu metadata. |
| Frontend manual | Common methods, `$tab`, `$modal`, `$auth`, `$cache`, `$download`, development conventions, new view, new API, new component, new style, request flow, interaction flow, request example, dependency import, route usage, route config, static route, dynamic route, common methods, component use, local registration, global registration, creation/use, component communication, permission use, multi-level directory, tab cache, icon use, color change, dictionary use, parameter use, exception handling, app path, content copy. | Prefer existing plugin/store/router/request/layout patterns and avoid duplicating global behavior in pages. |
| Component docs | Base framework components, tree select, rich text editor, table pagination, editor, right toolbar, image upload, image preview, file upload, form design, dictionary component, tree split panel, Excel import component, cron expression component. | Reuse existing `src/components/**`, `src/plugins/**`, and Element Plus conventions before adding new UI primitives. |
| Project extension | SpringBoot3, Vue3, TypeScript, Oracle, App, Eureka, OAuth2, Plus and other extension variants. | Treat as compatibility/reference material; do not mix Vue2/Vue3 or JavaScript/TypeScript conventions blindly. |
| Update log | Version entries from v1.0.0 through current release. | Use as checklist for package, route, layout, permission, and component behavior changes. |
| Service gateway | Route rules, route config, rate limit, circuit/degrade, CORS, blacklist/whitelist, global filters, Sentinel gateway behavior. | Verify gateway-facing base URL, CORS, 401/403/429/503 handling, and request headers from `src/utils/request.js`. |
| Auth center | Login auth, refresh token, system logout. | Verify login/logout/getInfo/captcha, token storage, route guard, lock screen and expired-token behavior. |
| Service invocation | Request parameters, timeout, exception config, interceptor, `InnerAuth`. | Frontend only sees gateway-facing API contracts; align payloads and error states, never call internal-only APIs. |
| Service monitoring | Admin UI, client config, login auth, realtime logs, dynamic logs, custom notification. | Map to monitor pages, online users, jobs, service/admin links and user-visible status/error handling. |
| System interface | Interface module, aggregation, global auth, Knife4j integration. | If exposed in UI, keep docs links/routes behind permissions and ensure auth header guidance is clear. |
| Circuit breaking/degrade | Flow rules, degrade rules, dynamic rules, Nacos rules, RestTemplate/OpenFeign support. | Handle backend 429/503/timeout/fallback responses clearly; do not mask degraded backend state as success. |
| Distributed file | Local/MinIO/FastDFS storage, download, access policy, Nginx, storage switching. | Use `FileUpload`, `ImageUpload`, preview and shared download helpers; trust backend URL/storage strategy. |
| Distributed transaction | Seata sample flow, Feign file call, rollback cases. | Frontend validates final business state and handles failure messages; do not assume success before backend confirms. |
| Distributed log | ELK and log collection. | Use operation/login log pages and network evidence; expose trace/request IDs only when backend intentionally returns them. |
| Application container deployment | Nginx, Docker, Compose, ports, env, volumes, networks. | Check static asset base path, API proxy/gateway path, refresh fallback and environment variables. |
| FAQ | Anonymous access, current user info, token validity, data permissions, Swagger display, captcha, encrypted password, XSS filtering, environment profiles, Long precision loss. | Map to route whitelist, user store, token handling, permission visibility, login page, request serialization and error display. |

When the task is local startup, build, deployment, or environment setup:

1. Inspect `.env.*` first:
   - `VITE_APP_BASE_API` determines gateway/API base path.
   - build mode determines which environment file is active.
2. Inspect `vite.config.js`:
   - proxy rules;
   - base path;
   - plugins;
   - compression;
   - SVG icon registration;
   - setup-extend/auto-import behavior.
3. Use declared scripts:
   - `npm run dev` for local dev;
   - `npm run build:prod` for production build;
   - `npm run build:stage` for staging build;
   - `npm run preview` for static preview.
4. For backend integration:
   - prefer gateway-facing API base URL;
   - do not hardcode individual microservice hosts in components;
   - verify login, current-user info, and `getRouters` after changing API base or proxy.
5. For deployment:
   - ensure built static assets are served with the correct base path;
   - ensure gateway/proxy forwards API calls;
   - confirm refresh on dynamic routes does not 404 at the web server layer.

## Frontend manual workflow

Use this when modifying the admin shell or general frontend behavior:

1. Login and session:
   - `src/views/login.vue` and `src/api/login.js` handle login/captcha/session APIs.
   - `src/store/modules/user.js` owns token, profile, roles, permissions, logout.
   - `src/utils/auth.js` owns token persistence.
2. Route guard:
   - `src/permission.js` owns whitelist, token check, lock screen redirect, user info loading, dynamic route registration.
   - Do not duplicate route-guard logic inside individual pages.
3. Dynamic routes:
   - backend returns route records through `getRouters`;
   - `src/store/modules/permission.js` maps `Layout`, `ParentView`, `InnerLink`, and `views/**` components;
   - route component values must match real `src/views/**` paths.
4. Layout:
   - `src/layout/**` owns sidebar, topbar, tags view, content frame, settings, and notices.
   - Changes to navigation must be checked against sidebar/topbar/tags view together.
5. State:
   - use Pinia modules under `src/store/modules/**`;
   - do not create parallel global state if an existing module already owns the concern.
6. Requests:
   - use `src/utils/request.js` for token, 401 behavior, duplicate-submit guard, errors, and downloads.
   - use `src/plugins/download.js` or shared download helper for exports.

## Component documentation map

Treat existing components as reusable admin primitives before adding new ones.

| Component / utility | Path | Use for |
| --- | --- | --- |
| Breadcrumb | `src/components/Breadcrumb` | Current route hierarchy. |
| Crontab | `src/components/Crontab` | Scheduled job cron expression editing. |
| DictTag | `src/components/DictTag` | Render dictionary values and tags. |
| Editor | `src/components/Editor` | Rich text editing. |
| ExcelImportDialog | `src/components/ExcelImportDialog` | Import workflows with upload + template/download. |
| FileUpload | `src/components/FileUpload` | General file uploads. |
| ImageUpload / ImagePreview | `src/components/ImageUpload`, `src/components/ImagePreview` | Image upload and preview. |
| IconSelect | `src/components/IconSelect` | Select SVG/menu icons. |
| Pagination | `src/components/Pagination` | Table pagination. |
| ParentView | `src/components/ParentView` | Route nesting placeholder. |
| RightToolbar | `src/components/RightToolbar` | Query toggle and refresh controls in list pages. |
| Screenfull | `src/components/Screenfull` | Fullscreen toggle. |
| SizeSelect | `src/components/SizeSelect` | Element Plus component size selection. |
| SvgIcon | `src/components/SvgIcon` | SVG icon rendering. |
| TreePanel | `src/components/TreePanel` | Tree/list side panels, often dept/menu related. |
| InnerLink/iFrame | `src/layout/components/InnerLink`, `src/components/iFrame` | External/internal iframe route rendering. |
| HeaderNotice | `src/layout/components/HeaderNotice` | Notice display and read state. |

Component rules:

1. Prefer these components over creating near-duplicates.
2. Keep props/events compatible with existing page usage.
3. For dictionary fields, prefer `DictTag` and existing dict store utilities.
4. For imports/exports, reuse existing import dialog and download flows.
5. For route icons, use `SvgIcon` and `src/assets/icons/svg` names consistent with backend menu metadata.

## Backend manual mirror for frontend pages

When implementing or modifying a backend manual feature in Vue3, map it to frontend structures:

| Backend/manual feature | Frontend page/API scope | Permission behavior |
| --- | --- | --- |
| User management | `src/views/system/user/**`, `src/api/system/user.js` | `system:user:*` and role assignment actions. |
| Role management | `src/views/system/role/**`, `src/api/system/role.js` | `system:role:*`, menu tree, dept tree, auth users. |
| Menu management | `src/views/system/menu`, `src/api/system/menu.js` | `system:menu:*`, route component/icon metadata. |
| Department management | `src/views/system/dept`, `src/api/system/dept.js` | `system:dept:*`, tree selection. |
| Post management | `src/views/system/post`, `src/api/system/post.js` | `system:post:*`. |
| Dictionary | `src/views/system/dict/**`, `src/api/system/dict/**` | `system:dict:*`, dict cache and tag rendering. |
| Parameters | `src/views/system/config`, `src/api/system/config.js` | `system:config:*`. |
| Notices | `src/views/system/notice/**`, `src/api/system/notice.js` | `system:notice:*`, read state/top notice. |
| Operation logs | `src/views/system/operlog`, `src/api/system/operlog.js` | `system:operlog:*`. |
| Login logs | `src/views/system/logininfor`, `src/api/system/logininfor.js` | `system:logininfor:*`, unlock action. |
| Online users | `src/views/monitor/online`, `src/api/monitor/online.js` | `monitor:online:*`, force logout. |
| Jobs | `src/views/monitor/job/**`, `src/api/monitor/job*.js` | job permissions, cron component. |
| Form builder | `src/views/tool/build/**` | visual form generation and generated output. |

### Backend manual subitem mirror

Use this map when a Vue3 change corresponds to a specific official Backend Manual subitem.

| Official subitem | Vue3 frontend scope | Keep aligned with backend |
| --- | --- | --- |
| Pagination implementation | Query form, table data, `Pagination`, `pageNum`, `pageSize`. | Request parameters and `TableDataInfo` response shape. |
| Frontend invocation implementation | `src/api/**` request module and page action flow. | URL, method, query/body payload, success/error message behavior. |
| Backend logic implementation | UI should expose backend state, not duplicate backend rules. | Validation that affects persistence remains backend-enforced. |
| Import/export | Toolbar buttons, `ExcelImportDialog`, template download, export download. | Permission strings, import result text, blob/download behavior. |
| Annotation parameter description | Table columns, form labels, dictionary tags, export/import labels. | Field labels and dictionary values must match backend `@Excel` metadata when used. |
| Export flow | Export button, query params, loading state, download helper. | Export uses current filters and backend data scope. |
| Import flow | Import dialog, upload endpoint, template action, result modal. | Import errors and row validation are displayed without swallowing backend messages. |
| Custom title information | Download filename, modal title, table/export labels. | User-facing title should match backend workbook/title convention. |
| Custom data handler | Frontend display conversion only. | Do not reimplement backend Excel conversion; only render returned values clearly. |
| Custom visible columns | Table visible columns and optional column picker. | Visible table/export columns should not conflict with backend export metadata. |
| Custom hidden columns | Sensitive fields omitted from table/form/export triggers. | Do not expose fields backend intentionally hides from export. |
| Export multiple object collections | Multi-section preview/download only when backend supports it. | Keep collection labels and ordering clear. |
| Export child list of object | Parent row with child list display or export trigger. | Preserve parent-child relationship in UI labels and payload. |
| Upload/download | `FileUpload`, `ImageUpload`, `ImagePreview`, shared download helper. | File size/type limits, URL format, token, and gateway path. |
| Upload flow | Form upload component, progress/result handling, preview. | Backend storage strategy and returned URL are authoritative. |
| Download flow | Download action, filename, loading, error handling. | Content disposition, auth failure, and stream errors. |
| Permission annotations | `v-hasPermi`, `v-hasRole`, route/menu visibility. | Backend still enforces real access. |
| `@RequiresRoles` | `v-hasRole` for role-level visibility. | Only hide/show UI; do not treat it as enforcement. |
| `@RequiresPermissions` | `v-hasPermi` and button permission strings. | Must match backend menu/button permission strings exactly. |
| Programmatic permission judgment | Runtime UI checks when backend returns capability flags. | Backend-denied operations must remain visible as errors when attempted directly. |

## Microservice frontend integration map

The frontend usually talks through the gateway. Use this matrix when the docs mention microservice sections.

| Microservice topic | Frontend impact |
| --- | --- |
| Service gateway | `VITE_APP_BASE_API`, Vite proxy, Axios base URL, CORS/401 behavior. |
| Auth center | login/logout/getInfo/captcha, token storage, route guard, password prompts. |
| Registry/config center | no direct UI change unless API base/path/config changes; verify runtime backend routing. |
| Service invocation | frontend sees only API contracts; align payloads with backend gateway-facing endpoints. |
| Service monitoring | monitor pages, online users, jobs, service/admin links when present. |
| System interface | Swagger/OpenAPI links/icons/routes, API docs menu entries. |
| Link tracing/logging | surface trace/request IDs only when backend exposes them intentionally. |
| Sharding | frontend should not know sharding; only verify pagination/filter consistency. |
| Circuit breaking/degrade | handle 429/503/timeout messages clearly; do not mask backend failures as success. |
| Distributed file | upload/download/image/file components and backend file service URLs. |
| Distributed transaction | frontend validates final business state; do not assume success before backend confirms. |
| Distributed log | operation/login log pages and network evidence for user actions. |
| Container deployment | static asset base path and API proxy/gateway path. |

## Project extension and update workflow

When adding frontend extensions or handling update logs/version changes:

1. Identify extension type:
   - page;
   - component;
   - API module;
   - layout/navigation;
   - theme/style;
   - build/deployment;
   - dependency update.
2. For new pages:
   - create `src/views/**` page;
   - create `src/api/**` module;
   - add backend menu route metadata;
   - add button permissions;
   - confirm `getRouters` returns matching `component` path;
   - verify dynamic route registration.
3. For component additions:
   - prefer `src/components/**`;
   - document expected props/events by usage pattern;
   - keep Element Plus visual language.
4. For package updates:
   - check Vue/Vite/Element Plus/Pinia/Vue Router compatibility;
   - build after update;
   - browser-test login, dynamic routes, Element Plus forms/tables/dialogs, upload/download.
5. For Vue2 ↔ Vue3 or JavaScript ↔ TypeScript pairing:
   - do not mix store/router conventions;
   - compare payload contracts, not only file names.

## Validation checklist

Use the smallest validation that covers the changed area:

- Build: `npm run build:prod` or the package manager equivalent.
- Dev server: `npm run dev`.
- Browser path:
  1. login;
  2. load current user info;
  3. load dynamic routes;
  4. render sidebar/topbar/tags view;
  5. open the changed page;
  6. test query/reset/add/edit/delete/export if changed;
  7. confirm button permissions for allowed and denied roles;
  8. inspect console errors and failed network requests.
- If only styles/layout changed, run visual QA and responsive checks.
- If request/auth changed, inspect `Authorization: Bearer <token>`, 401 handling, repeat-submit behavior, and download handling.

## Safety notes

- Do not hardcode backend origin when `VITE_APP_BASE_API` already controls API base URL.
- Do not bypass dynamic route generation by duplicating backend menus in frontend code unless the route is intentionally static.
- Do not remove backend authorization assumptions just because frontend hides actions.
- Do not introduce TypeScript-only patterns into this JavaScript variant unless the user explicitly migrates the project.
- Do not add Tailwind-specific workflows; this project uses SCSS and Element Plus.
- Treat official docs as baseline and current repository/runtime behavior as source of truth when they differ.