# TradeOS AI - Tradovate/NinjaTrader Integration Request

## Short Message

Hello NinjaTrader/Tradovate Developer Relations team,

we are building TradeOS AI, a trading journal and analytics platform for active futures traders. The product helps users import their historical trades, maintain a trading journal, analyze performance and behavior, and generate process-focused AI insights.

TradeOS AI is not a signal platform, does not place trades, and does not provide investment advice. The integration is intended for read-only historical trade import and account selection.

We would like to apply for NinjaTrader/Tradovate Ecosystem or Partner access and request OAuth client credentials for a third-party application.

## Product

Name: TradeOS AI

Category: Trade journal, trading analytics, performance review, AI-assisted process improvement

Target users:

- Active futures traders
- NQ/ES traders
- Prop-firm/evaluation account traders
- Traders using ICT/FVG/iFVG/market-structure style playbooks

Core promise:

Import your trades automatically and understand why you are really making or losing money.

## Integration Goal

We want users to connect their Tradovate/NinjaTrader account via OAuth, select which accounts should be imported, and then automatically sync historical execution/trade data into their private TradeOS AI journal.

The integration should support:

- OAuth authorization code flow
- user account discovery
- user-selected account import
- historical fills/executions import
- fill pair / closed trade reconstruction
- token renewal
- scheduled background sync

## Requested Access

We are requesting:

- Third-party OAuth client credentials
- OAuth test/staging credentials
- Staging API access
- Test/demo user account with sample order/fill history
- Documentation for supported OAuth scopes and read-only access
- Confirmation whether end users need individual API Access add-ons, or whether partner OAuth covers end-user authorization

## Requested Environments

Local development redirect URI:

```txt
http://localhost:3000/api/brokers/tradovate/callback
```

Staging redirect URI:

```txt
https://staging.tradeos.ai/api/brokers/tradovate/callback
```

Production redirect URI:

```txt
https://app.tradeos.ai/api/brokers/tradovate/callback
```

Requested staging hosts, if available:

```txt
demo-api.staging.ninjatrader.dev
live-api.staging.ninjatrader.dev
md-api.staging.ninjatrader.dev
```

## Data Needed

Read-only data required:

- User profile / identity confirmation
- Account list
- Account names/specs
- Orders
- Fills / executions
- Fill pairs / closed position pairs
- Contract metadata / symbols
- Timestamps
- Side: buy/sell
- Quantity
- Fill price
- Commission and fees, if available
- Realized PnL, if available

No trading functionality is required for the MVP.

## Endpoints We Expect To Use

OAuth:

```txt
/v1/auth/oauthtoken
/v1/auth/renewaccesstoken
```

Account/trade import:

```txt
/v1/auth/me
/v1/account/list
/v1/order/list
/v1/fill/list
/v1/fillPair/list
/v1/contract/items
```

We are open to recommended alternatives if there is a better read-only trade-history endpoint.

## Security Model

TradeOS AI will:

- store access tokens encrypted at rest
- never expose API keys or tokens to the browser
- refresh access tokens server-side before expiry
- allow users to disconnect/reconnect broker access
- allow users to select which Tradovate/NinjaTrader accounts should be imported
- run imports server-side only
- store minimal required broker metadata
- deduplicate imported records by external fill/fillPair IDs

## Current Implementation Status

The TradeOS AI MVP already includes:

- Next.js app with authenticated user sessions
- PostgreSQL + Prisma data model
- CSV/XLSX trade import
- trade journal
- setup tagging
- performance analytics
- AI process insights
- Tradovate OAuth connection model
- encrypted broker token storage
- account selection UI
- scheduled token refresh endpoint
- scheduled sync endpoint

Current internal models:

- `BrokerConnection`
- `BrokerAccount`
- `BrokerSyncJob`
- `Trade`

Current callback path:

```txt
/api/brokers/tradovate/callback
```

## Compliance / Product Boundaries

TradeOS AI does not:

- generate buy/sell signals
- execute orders
- provide price predictions
- provide investment advice
- promise profits
- manage customer funds

TradeOS AI does:

- analyze historical trades
- calculate performance metrics
- identify recurring behavior and setup patterns
- help users improve their trading process
- show risk/process insights based only on past data

## Questions For NinjaTrader/Tradovate

1. What is the correct process to apply for third-party OAuth client credentials?
2. Can TradeOS AI receive read-only OAuth scopes for account/trade-history import?
3. Do end users need individual API Access subscriptions, or does partner OAuth cover end-user authorization?
4. Is there a staging/sandbox OAuth environment available?
5. Can you provide a demo account with sample fills/orders/fillPairs?
6. Which endpoint is recommended for importing closed trades or reconstructing round-trip trades?
7. Are commissions, exchange fees, and realized PnL available in the API response?
8. Are there rate limits we should design around?
9. What branding/disclosure requirements apply to connected third-party apps?
10. What is the approval timeline for ecosystem/partner access?

## Contact

Company/Product: TradeOS AI

Website: TBD

Technical contact: TBD

Email: TBD

Use case: Read-only trade journal and analytics integration
