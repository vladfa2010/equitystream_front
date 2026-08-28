# План внедрения Playwright E2E-тестов

**Версия:** 1.0  
**Дата:** 2026-08-28  
**Статус:** черновик плана, требует согласования перед реализацией  

## 1. Цель

Автоматизировать критические пользовательские сценарии в админке и клиентском кабинете EquityStream с помощью Playwright. Тесты должны запускаться локально и в CI/CD, использовать чётко именованные тестовые данные (`Test_user_*`, `Test_deal_*`) и не оставлять мусора в продакшен-БД.

## 2. Что уже покрыто ручными smoke-тестами

Backend API smoke-тесты находятся в `equitystream/docs/E2E_TEST_CASES.md`. Playwright покроет именно UI-слой и end-to-end флоу.

## 3. Стратегия тестовых данных

### 3.1 Именование

| Сущность | Шаблон имени | Пример | Назначение |
|----------|-------------|--------|------------|
| Тестовый админ | `Test_user_admin_{timestamp}` | `Test_user_admin_20260828_124500` | Логин в админку |
| Тестовый клиент | `Test_user_client_{timestamp}` | `Test_user_client_20260828_124500` | Регистрация/approve/CRUD клиентов |
| Тестовая сделка | `Test_deal_{ticker}_{timestamp}` | `Test_deal_ACME_20260828_124500` | Создание/редактирование сделки |
| Email клиента | `test_client_{timestamp}@equitystream.test` | — | Уникальный почтовый ящик |

### 3.2 Жизненный цикл данных

1. **BeforeAll / BeforeEach**: создавать тестового пользователя и сделку через API (helpers), если тест этого требует.
2. **AfterAll / AfterEach**: удалять созданные тестовые сущности через API.
3. **Cleanup hook**: даже если тест упал, в `test.afterEach` идёт попытка удалить `Test_user_*` и `Test_deal_*` по имени.

### 3.3 Изоляция

- Каждый тестовый файл получает свой суффикс `timestamp`.
- Никакие тесты не используют реальных пользователей (`vladfa2010@gmail.com`) или реальных сделок.
- Все операции пишутся в ту же БД, что и приложение, поэтому тесты запускаются только на `staging` или на `prod` в специальное окно.

## 4. Технический стек

| Компонент | Выбор |
|-----------|-------|
| Фреймворк | `@playwright/test` |
| Браузеры | Chromium (основной), Firefox/WebKit — опционально |
| Язык | TypeScript |
| Auth-фикстура | `storageState` + API-логин |
| Helpers | `frontend/e2e/helpers/api.ts` |
| Page Objects | `frontend/e2e/pages/*.ts` |

## 5. Структура директорий

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   └── auth.fixture.ts          # авторизация админа/клиента
│   ├── helpers/
│   │   ├── api.ts                   # REST API wrappers для создания/удаления тестовых данных
│   │   └── cleanup.ts               # удаление Test_user_* и Test_deal_*
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── AdminDashboardPage.ts
│   │   ├── DealEditorPage.ts
│   │   ├── DealDetailPage.ts
│   │   ├── ClientsPage.ts
│   │   └── ClientProfilePage.ts
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   ├── admin-deals.spec.ts
│   │   ├── admin-clients.spec.ts
│   │   └── client-dashboard.spec.ts
│   └── setup/
│       └── global-setup.ts          # опционально: подготовка базового admin-токена
├── playwright.config.ts
└── package.json                     # + @playwright/test
```

## 6. Page Objects (описание)

### LoginPage
- `goto()`
- `login(email, password)`
- `expectError(message)`

### AdminDashboardPage
- `goto()`
- `openDeal(dealName)`
- `openClientsTab()`
- `clickCreateDeal()`

### DealEditorPage
- `fillCompanyInfo(fields)`
- `fillClientAllocation(client, amount, isLead)`
- `submit()`
- `expectDealCreated(dealName)`

### DealDetailPage
- `expectFieldVisible(label, value)`
- `clickEdit()`
- `editForm.fillRawAmount(amount)`
- `editForm.fillDealDate(date)`
- `editForm.save()`
- `expectRawAmount(amount)`
- `expectDealDate(date)`

### ClientsPage
- `createClient(name, email, password, role)`
- `findClientRow(email)`
- `deactivateClient(email)`
- `setPassword(email, newPassword)`

## 7. Тест-кейсы (приоритеты)

### P0 — критичный путь

| ID | Сценарий | Ожидаемый результат |
|----|----------|---------------------|
| AUTH-01 | Успешный логин админа | Открывается `/admin` |
| AUTH-02 | Логин pending-клиента → редирект на `/pending` | Показана страница ожидания |
| DEAL-01 | Создание сделки со всеми полями | Сделка `Test_deal_*` создана, редирект на детали |
| DEAL-02 | Редактирование Raw Amount и Deal Date | Значения сохранены и отображены в карточке |
| CLIENT-01 | Админ создаёт клиента `Test_user_client_*` | Клиент появляется в списке All Clients |
| CLIENT-02 | Админ approve pending-клиента | Статус клиента становится active |
| CLIENT-03 | Админ деактивирует клиента | Статус inactive |

### P1 — дополнительные сценарии

| ID | Сценарий |
|----|----------|
| DEAL-03 | Добавление клиента в сделку |
| DEAL-04 | Удаление сделки |
| PRICE-01 | Обновление текущей цены сделки |
| CLIENT-04 | Ручная смена пароля клиента админом |
| CLIENT-05 | Логин клиента и открытие дашборда |

### P2 — негативные и edge-case

| ID | Сценарий |
|----|----------|
| DEAL-NEG-01 | Создание сделки без обязательных полей → ошибка |
| DEAL-NEG-02 | Создание сделки с дублирующимся тикером → ошибка |
| AUTH-NEG-01 | Неверный пароль → ошибка |

## 8. План внедрения по этапам

### Этап 1. Подготовка инфраструктуры
- [ ] Установить `@playwright/test` и браузеры.
- [ ] Создать `playwright.config.ts` с `baseURL` staging/prod.
- [ ] Настроить `storageState` для быстрого логина админа.
- [ ] Создать `e2e/helpers/api.ts` с методами:
  - `createTestAdmin()`
  - `createTestClient()`
  - `createTestDeal()`
  - `deleteTestUserByEmail()`
  - `deleteTestDealByName()`
- [ ] Создать `e2e/helpers/cleanup.ts`.

### Этап 2. Базовые Page Objects
- [ ] `LoginPage`
- [ ] `AdminDashboardPage`
- [ ] `DealEditorPage`
- [ ] `DealDetailPage`
- [ ] `ClientsPage`

### Этап 3. P0-тесты
- [ ] `auth.spec.ts` — AUTH-01, AUTH-02.
- [ ] `admin-deals.spec.ts` — DEAL-01, DEAL-02.
- [ ] `admin-clients.spec.ts` — CLIENT-01, CLIENT-02, CLIENT-03.

### Этап 4. P1/P2-тесты
- [ ] Расширение `admin-deals.spec.ts`.
- [ ] `client-dashboard.spec.ts`.
- [ ] Негативные сценарии.

### Этап 5. CI/CD
- [ ] GitHub Action `e2e.yml` (или обновление существующего).
- [ ] Запуск `npx playwright test` перед merge.
- [ ] Сохранение `playwright-report/` и trace-zip в артефакты.

## 9. Риски и ограничения

| Риск | Митигация |
|------|-----------|
| Тесты пишут в прод-БД | Использовать суффиксы `Test_*` + обязательный cleanup; рассмотреть отдельную staging-среду |
| Нестабильность из-за анимаций/лоадеров | `await expect(...).toBeVisible()`, data-testid, `networkidle` |
| Email-уведомления в тестах | Пока не тестируем; проверяем только API-ответ |
| Параллельный запуск конфликтует по данным | Разные `timestamp` для каждого worker, изоляция по имени |

## 10. Открытые вопросы

1. Будет ли отдельный staging-контур или тесты запускаем на prod с `Test_*` данными?
2. Нужен ли тестовый SMTP/Resend-аккаунт для проверки email-уведомлений?
3. Запускать Playwright в CI на каждый PR или только на релиз?
4. Какой браузерный viewport использовать по умолчанию (desktop 1920x1080)?

## 11. Следующий шаг

После согласования плана — реализовать Этап 1 (инфраструктура + helpers) и первый P0-тест `AUTH-01`.
