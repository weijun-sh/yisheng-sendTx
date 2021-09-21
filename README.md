## 1. 启动脚本
```js
node app.js
```
## 2. 配置密码和私钥
```js
根目录下config.js
global.account_keystore = './test-account-passwd-123456--0xe2bcaF8F9F56a6D4880C168FA8fa02b02bFD19e0' //TODO
global.account_password = './password.123456' //TODO
global.address_to = '0xe2bcaF8F9F56a6D4880C168FA8fa02b02bFD19e0' //TODO
global.custom_data = 'recordtest' //TODO
```
## 3. 执行上链脚本
### 3.1 单独执行上链脚本
#### 3.3.1 订单处理
```js
dataService.js
dealOrders()
```
#### 3.3.2 报告处理
```js
dataService.js
dealReports()
```
#### 4. 修改mongodb连接 (位于app.js)
```js
mongoose.connect('mongodb://root:123456@localhost:27017/block?authSource=admin')
```
