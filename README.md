# xmx-cli-dev
本仓库是一个*lerna*分包管理的，基于*commander*指令构建的脚手架工具。
## 仓库目录
仓库由*command*、*core*、*models*和*utils*四部分组成，四个目录下各有多个基于*lerna*创建的package包，这些包都可以作为单独的项目仓库，提供给其他项目使用。
## command
command作为指令仓库，也是整个项目的核心部分之一。
脚手架最核心部分分两块，一块是指令执行准备部分，另一块就是指令部分。
### init
*init*指令流程如下
![Image](https://github.com/user-attachments/assets/e92e790f-bde4-4511-aba8-560ddefef141)
![Image](https://github.com/user-attachments/assets/0253e47b-c096-4b5e-a080-c23eefe83dbb)
![Image](https://github.com/user-attachments/assets/10ecab50-775a-4cd5-9cf9-45a19f3e9f2f)
## core
core是脚手架的另一个核心部分，此处既是脚手架的的入口，又是脚手架指令的预准备阶段。
### cli
脚手架启动后，首先执行core的cli，注册commander指令、指引、错误处理等。
判断用户输入的指令是否存在，并执行对应的指令。
### exec
exec包负责执行init包下的exec操作，管理代码包指令的命令执行。
## models
models包是全局的基础包，这里管理着command指令的基础类和package包的基础类。
### command
command注册了一个指令的基础框架，也注册了一个指令的基础执行流程。
全部指令只需要在这包的基础上延伸扩展，编写业务逻辑即可。
### package
package注册了一个包类所需要的最小参数，并且管理后续关于package所需要的所有参数和判断。
脚手架是和指令以及包做交互的的工具，包的入口文件、版本号以及下载位置都可以通过这个包来管理和获取。
## utils
utils包是一个工具包，负责为其他模块提供开箱即用的工具。
### format-path
统一windows、linux和mac下的路径处理。
### get-npm-info
获取npm包的信息。
### log
管理命令行输出信息
### request
负责和后端沟通的request逻辑管理
### utils
其他工具

## 其他
仓库目前用的依赖链比较旧，作者将抽空逐步替换成现代依赖链，同时不断升级指令包，提供更多的可用的指令包。
仓库作为脚手架基础需要搭配特定模板使用，如果你对跑通脚手架流程感兴趣，可以在issue联系作者。
