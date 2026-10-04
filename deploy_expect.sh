#!/usr/bin/expect -f

set timeout 600
set SERVER_IP "118.25.141.173"
set SERVER_USER "ubuntu"
set SERVER_PASS "Chris@1989"

puts "=== Step 1: 上传部署文件 ==="
spawn scp -o StrictHostKeyChecking=no /Volumes/z/202606/momentum-main/momentum-deploy.tar.gz /Volumes/z/202606/momentum-main/server_deploy.sh $SERVER_USER@$SERVER_IP:/tmp/
expect "password:"
send "$SERVER_PASS\r"
expect eof
puts "上传完成"

puts "\n=== Step 2: 执行服务器端部署 ==="
spawn ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP
expect "password:"
send "$SERVER_PASS\r"
expect "$ "

send "chmod +x /tmp/server_deploy.sh && bash /tmp/server_deploy.sh\r"
expect "$ "

send "exit\r"
expect eof

puts "\n=== 全部完成 ==="
