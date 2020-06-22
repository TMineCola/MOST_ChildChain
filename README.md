# MOST - Child Chain

## Introduction

科技部計畫 - 異質區塊鏈之跨鏈信賴與共識機制之子鏈節點 Demo Code

由子鏈一般節點接收 HTTP 跨鏈請求並調用智慧合約函式產生跨鏈交易紀錄，透過監聽合約事件使鏈上節點向子鏈橋接節點發起投票
投票達 2/3 後會由中繼鏈查看合約內容並查找對應另一鏈之橋接節點 IP Address 進行發送，當三個鏈完成 2 Phase Commit 後即代表跨鏈交易生效
由其他子計畫節點執行請求內容並回應

## Installation

### Host Environment

- OS: Ubuntu 18.04.4 LTS
- BlockChain: Quorum with clique consensus
    - Using https://github.com/pccr10001/quorum-docker-Nnodes
- Node.js Version: v14.4.0
- NPM Version: 6.14.5

1. 安裝全域 NPM 套件及專案套件
    - Truffle 用來編輯及部署智慧合約
    - pm2 用來管理多個 node.js 服務並監控狀態
    ```
    npm install truffle -g
    npm install pm2 -g
    npm install
    ```
2. Clone https://github.com/pccr10001/quorum-docker-Nnodes 並修改設定檔 `quorum-docker-Nnodes/Nnodes/config.sh` 中部分
    ```
    # Interface IP for RLP listening when using docker host network
    interface_ip="主機 IP Address"

    # Total nodes to deploy
    total_nodes=7

    # Signer nodes for Clique and IBFT
    signer_nodes=7

    # Consensus engine ex. raft, clique, istanbul
    consensus=clique
    ```
3. 執行 `setup.sh`
4. 檢查 Quorum Docker 是否正常啟動 `docker ps`
5. Clone 本專案
6. 修改專案中 `truffle-config.js`
    - 設定 host, port 至本機區塊鏈 (預設 Port 23001~23007)
    - 增加 gasPrice 及 type 設定
    ```
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 23001,            // Standard Ethereum port (default: none)
      network_id: "*",      // Any network (default: none)
      gasPrice: 0,
      type:"quorum"
    },
    ```
7. 編譯並部署合約
    - 如果已經部署過的話重置合約使用 `npm run-script reset` 對應指令為 `truffle migrate --reset`
    - 編譯完成請紀錄智慧合約位置 (顯示於 Terminal) 並填入 `.env` 對應 `CROSSCHAIN_CONTRACT_ADR` 欄位
    - ABI 會產生於 `/build/合約名稱.json` 之中，對應填入 `.env` 中的 `CONTRACT_CROSS_JSON_PATH` 欄位
    ```
    # 對應指令是 truffle build
    npm run-script build
    # 對應指令是 truffle migrate
    npm run-script deploy
    ```
8. 區塊鏈帳號及私鑰位於 `/quorum-docker-Nnodes/Nnodes/qdata_${節點編號}/dd` 中 
    - `/keystore` 資料夾內唯一的檔案名稱 -- 後代表帳號
    - `nodekey` 的內容為私鑰
    - 上述兩個資訊對應填入 `.env` 中的 `PUBLIC_KEY`(帳號) `PRIVATE_KEY`(私鑰) 之中
    - 並將 `geth.ipc` 的路徑填入 `.env` 中的 `QUORUM_IPC_PROVIDER`
9. 填入對應剩餘資料
    - `MODE` 模式，目前區分 PRODUCTION 及 DEV
    - `PORT` 埠號，服務對應的 PORT
    - `CHAIN_ID` 區塊鏈代號，用來識別跨鏈交易來源與目標方
    - `ROLE` 角色，用來區分 BRIDGE(橋接節點) 或 MEMBER(一般節點)
    - `CHAIN_COUNT` 鏈內節點數，用來判斷投票門檻
    - `MINUTES_TIME_FOR_CHECK` 投票檢查時間，多少分鐘檢查一次投票狀態
    - `MINUTES_TIME_FOR_REVOKE` 交易撤銷時間，超過多少分鐘沒有狀態更新則撤銷跨鏈交易
    - `BRIDGE_NODE_IP` 橋接節點 IP Address
    - `RELAY_CHAIN_IP` 中繼鏈橋接節點 IP Address
10. 啟動服務
    ```
    npm start npm --name "顯示名稱, 如: Node1" -- start
    ```

**可以建立多個節點服務對應不同的帳號及 Port**

## Project Architecture

    ```
    .
    ├── app.js - 服務進入點
    ├── bin
    │   └── www
    ├── build
    ├── contracts - 合約原始 Solidty 檔
    │   ├── CrossChainTransaction.sol - 跨鏈合約
    │   ├── Migrations.sol
    │   └── NamingService.sol - 命名服務合約
    ├── lib
    │   ├── consensis-vote.js - 投票機制
    │   ├── contract-listener.js - 合約監聽
    │   ├── contract-manager.js - 合約功能調用
    │   ├── quorum-connector.js - 建立 Quorum 連線、 ABI 載入並建立合約映射
    │   └── transaction-searcher.js - 查詢鏈上交易紀錄
    ├── migrations
    │   ├── 1_initial_migration.js
    │   └── 2_deploy_contracts.js - Truffle 部署合約
    ├── model
    │   ├── enum - 跨鏈交易狀態 enum
    │   └── vote.js - 投票物件
    ├── node_modules - 依賴套件
    ├── package-lock.json
    ├── package.json - 依賴套件描述檔
    ├── public - 開放檔案存取的資料夾
    ├── routes - HTTP 路由
    │   ├── cross-chain.js - 跨鏈交易相關
    │   ├── index.js - 查詢節點狀態
    │   ├── middleware - 中介層 (內負責掛入投票 Queue)
    │   └── vote.js - 投票
    ├── truffle-config.js - truffle 連線及合約部署相關設定
    └── views - 網頁 ejs 樣板
    ```