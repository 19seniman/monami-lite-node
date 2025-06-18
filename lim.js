const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  countdown: (msg) => process.stdout.write(`\r${colors.blue}[⏰] ${msg}${colors.reset}`),
  banner = () => {
  const { bold, cyan, magenta, green, yellow, reset } = colors;
  console.log(magenta + '======================================================' + reset);
  console.log(cyan + bold(
    '       __  __                      _       _           '
  ));
  console.log(cyan + bold(
    '      |  \\/  | ___  _ __ ___   ___| | __ _| |_ ___  _ __ '
  ));
  console.log(cyan + bold(
    '      | |\\/| |/ _ \\| \'_ ` _ \\ / _ \\ |/ _` | __/ _ \\| \'__|'
  ));
  console.log(cyan + bold(
    '      | |  | | (_) | | | | | |  __/ | (_| | || (_) | |   '
  ));
  console.log(cyan + bold(
    '      |_|  |_|\\___/|_| |_| |_|\\___|_|\\__,_|\\__\\___/|_|   '
  ));
  console.log(magenta + '======================================================' + reset);
  console.log();
  console.log(green + bold('  FREE PALESTINE ') + reset + '   -   ' + yellow('19Seniman From  Insider') + '\n');
  }
};

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0"
];

class MonamiBot {
  constructor() {
    this.accounts = [];
    this.proxies = [];
  }

  getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  loadProxies() {
    try {
      if (fs.existsSync('proxies.txt')) {
        const proxyData = fs.readFileSync('proxies.txt', 'utf8');
        this.proxies = proxyData.split('\n').filter(line => line.trim());
      }
    } catch (error) {
      logger.error(`Error loading proxies: ${error.message}`);
    }
  }

  createProxyAgent(proxy) {
    if (!proxy) return null;
    
    try {
      if (proxy.startsWith('http://')) {
        return new HttpProxyAgent(proxy);
      } else if (proxy.startsWith('https://')) {
        return new HttpsProxyAgent(proxy);
      } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
        return new SocksProxyAgent(proxy);
      } else {
        
        return new HttpProxyAgent(`http://${proxy}`);
      }
    } catch (error) {
      logger.error(`Error creating proxy agent: ${error.message}`);
      return null;
    }
  }

  loadAccounts() {
    let accountIndex = 1;
    while (true) {
      const email = process.env[`EMAIL_${accountIndex}`];
      const password = process.env[`PASS_${accountIndex}`];
      
      if (!email || !password) break;
      
      const proxy = this.proxies.length > 0 ? 
        this.proxies[(accountIndex - 1) % this.proxies.length] : null;
      
      this.accounts.push({
        email,
        password,
        proxy,
        accessToken: null,
        userAgent: this.getRandomUserAgent()
      });
      
      accountIndex++;
    }
    
    if (this.accounts.length === 0) {
      logger.error('No accounts found! Please check your .env file.');
      process.exit(1);
    }
  }

  createAxiosInstance(account) {
    const config = {
      timeout: 30000,
      headers: {
        'User-Agent': account.userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.7',
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1'
      }
    };

    if (account.proxy) {
      const agent = this.createProxyAgent(account.proxy);
      if (agent) {
        config.httpsAgent = agent;
        config.httpAgent = agent;
      }
    }

    return axios.create(config);
  }

  async login(account) {
    try {
      logger.loading(`Logging in account: ${account.email}`);
      
      const axiosInstance = this.createAxiosInstance(account);
      
      const response = await axiosInstance.post('https://monami.network/api/login', {
        email: account.email,
        password: account.password
      });

      if (response.data && response.data.accessToken) {
        account.accessToken = response.data.accessToken;
        logger.success(`Login successful for ${account.email}`);
        return true;
      } else {
        logger.error(`Login failed for ${account.email}: No access token received`);
        return false;
      }
    } catch (error) {
      logger.error(`Login failed for ${account.email}: ${error.message}`);
      return false;
    }
  }

  async checkin(account) {
    try {
      logger.loading(`Checking in account: ${account.email}`);
      
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      const response = await axiosInstance.patch('https://api.monami.network/users/checkin', {
        email: account.email
      });

      if (response.data && response.data.status) {
        logger.success(`Check-in successful for ${account.email}: ${response.data.message}`);
        return true;
      } else {
        logger.error(`Check-in failed for ${account.email}: ${response.data?.message || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      logger.error(`Check-in failed for ${account.email}: ${error.message}`);
      return false;
    }
  }

  async getUserInfo(account) {
    try {
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      const response = await axiosInstance.get('https://api.monami.network/users');
      
      if (response.data) {
        const user = response.data;
        logger.info(`User Info for ${account.email}:`);
        console.log(`  ${colors.cyan}├─ Country: ${user.country}${colors.reset}`);
        console.log(`  ${colors.cyan}├─ Rank: ${user.rank}${colors.reset}`);
        console.log(`  ${colors.cyan}├─ Level: ${user.level}${colors.reset}`);
        console.log(`  ${colors.cyan}├─ XP: ${user.xp?.amount || 0}${colors.reset}`);
        console.log(`  ${colors.cyan}├─ Ref Code: ${user.refcode}${colors.reset}`);
        console.log(`  ${colors.cyan}└─ EVM Address: ${user.addressEvm}${colors.reset}`);
        return user;
      }
    } catch (error) {
      logger.error(`Failed to get user info for ${account.email}: ${error.message}`);
    }
    return null;
  }

  async updateLastActive(account) {
    try {
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      await axiosInstance.patch('https://api.monami.network/points/update-last-active', {
        email: account.email
      });
      
      logger.success(`Updated last active for ${account.email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update last active for ${account.email}: ${error.message}`);
      return false;
    }
  }

  async getPointsInfo(account) {
    try {
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      const response = await axiosInstance.get(`https://api.monami.network/points/update-point?email=${account.email}`);
      
      if (response.data) {
        const points = response.data;
        logger.info(`Points Info for ${account.email}:`);
        console.log(`  ${colors.yellow}├─ Points Per Minute: ${points.pointsPerMinutes}${colors.reset}`);
        console.log(`  ${colors.yellow}├─ Points Farm Today: ${points.pointsFarmToday.toFixed(6)}${colors.reset}`);
        console.log(`  ${colors.yellow}├─ Total Points: ${points.totalPointsReceived}${colors.reset}`);
        console.log(`  ${colors.yellow}├─ Today Uptime: ${points.todayUptime} hours${colors.reset}`);
        console.log(`  ${colors.yellow}├─ Level Boost: ${points.levelBoost}x${colors.reset}`);
        console.log(`  ${colors.yellow}└─ Rank Boost: ${points.rankBoost}x${colors.reset}`);
        return points;
      }
    } catch (error) {
      logger.error(`Failed to get points info for ${account.email}: ${error.message}`);
    }
    return null;
  }

  async getTasks(account) {
    try {
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      const userResponse = await axiosInstance.get('https://api.monami.network/users');
      
      if (userResponse.data && userResponse.data.task) {
        return userResponse.data.task;
      }
    } catch (error) {
      logger.error(`Failed to get tasks for ${account.email}: ${error.message}`);
    }
    return null;
  }

  async completeTask(account, taskField) {
    try {
      const axiosInstance = this.createAxiosInstance(account);
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${account.accessToken}`;
      
      const response = await axiosInstance.patch('https://api.monami.network/users/task', {
        email: account.email,
        field: taskField
      });

      if (response.data) {
        logger.success(`Completed task ${taskField} for ${account.email}`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to complete task ${taskField} for ${account.email}: ${error.message}`);
    }
    return false;
  }

  async completeAllTasks(account) {
    logger.step(`Starting tasks completion for ${account.email}`);
    
    const taskFields = [
      'connectX',
      'followX', 
      'connectDiscord',
      'joinDiscord',
      'oneRef',
      'threeRef',
      'fiveRef',
      'tenRef',
      'twentyFiveRef',
      'fiftyRef',
      'oneHundredRef',
      'oneHundredFiftyRef',
      'twoHundredRef',
      'threeHundredRef'
    ];

    for (const taskField of taskFields) {
      await this.completeTask(account, taskField);
      await this.sleep(2000); 
    }
    
    logger.success(`All tasks completed for ${account.email}`);
  }

  async startNetworkConnection(account) {
    logger.step(`Starting network connection for ${account.email}`);

    const updateInterval = setInterval(async () => {
      await this.updateLastActive(account);
      await this.getPointsInfo(account);
    }, 10 * 60 * 1000); 

    await this.updateLastActive(account);
    
    logger.success(`Network connection started for ${account.email} - Points will be updated every 10 minute`);
    
    return updateInterval;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async countdown(seconds) {
    for (let i = seconds; i > 0; i--) {
      logger.countdown(`Waiting ${i} seconds...`);
      await this.sleep(1000);
    }
    console.log(); 
  }

  async processAccount(account) {
    logger.step(`Processing account: ${account.email}`);

    const loginSuccess = await this.login(account);
    if (!loginSuccess) {
      logger.error(`Skipping account ${account.email} due to login failure`);
      return null;
    }

    await this.sleep(2000);

    await this.checkin(account);
    await this.sleep(2000);

    const userInfo = await this.getUserInfo(account);
    await this.sleep(2000);

    await this.getPointsInfo(account);
    await this.sleep(2000);

    await this.completeAllTasks(account);
    await this.sleep(3000);

    const intervalId = await this.startNetworkConnection(account);
    
    return intervalId;
  }

  async run() {
    logger.banner();

    this.loadProxies();
    this.loadAccounts();

    logger.info(`Loaded ${this.proxies.length} proxies`);
    logger.info(`Loaded ${this.accounts.length} accounts`);
    
    logger.info('Starting Monami Auto Bot...');
    await this.sleep(2000);

    const intervals = [];

    for (let i = 0; i < this.accounts.length; i++) {
      const account = this.accounts[i];
      
      logger.step(`Processing account ${i + 1}/${this.accounts.length}`);
      
      const intervalId = await this.processAccount(account);
      if (intervalId) {
        intervals.push(intervalId);
      }

      if (i < this.accounts.length - 1) {
        await this.countdown(10);
      }
    }

    logger.success('All accounts processed successfully!');
    logger.info('Bot is now running in background. Points will be updated every 1 minute for each account.');

    process.on('SIGINT', () => {
      logger.info('Stopping bot...');
      intervals.forEach(interval => clearInterval(interval));
      process.exit(0);
    });
  }
}

const bot = new MonamiBot();
bot.run().catch(error => {
  logger.error(`Bot error: ${error.message}`);
  process.exit(1);
});
