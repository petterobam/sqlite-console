#!/bin/bash
# author:petterobam
# url:https://github.com/petterobam/sqlite-console


# Usage: sh sqlite-console.sh start "-Xms128m -Xmx128m"
# Usage: sh sqlite-console.sh stop
# Usage: sh sqlite-console.sh status
# Usage: sh sqlite-console.sh reload 10
# Usage: sh sqlite-console.sh log

env_args="-Xms128m -Xmx128m"
sleeptime=0
arglen=$#

# get sqlite-console pid
get_pid(){
    pname="`find .. -name 'sqlite-console*.jar'`"
    pname=${pname:3}
    pid=`ps -ef | grep $pname | grep -v grep | awk '{print $2}'`
    echo "$pid"
}

startup(){
    pid=$(get_pid)
    if [ "$pid" != "" ]
    then
        echo "sqlite-console already startup!"
    else
        jar_path=`find .. -name 'sqlite-console*.jar'`
        echo "jarfile=$jar_path"
        cmd="java $1 -jar $jar_path > ./sqlite-console.out < /dev/null &"
        echo "cmd: $cmd"
        java $1 -jar $jar_path > ./sqlite-console.out < /dev/null &
        echo "---------------------------------"
        echo "启动完成，按CTRL+C退出日志界面即可>>>>>"
        echo "---------------------------------"
        show_log
    fi
}

shut_down(){
    pid=$(get_pid)
    if [ "$pid" != "" ]
    then
        kill -9 $pid
        echo "sqlite-console is stop!"
    else
        echo "sqlite-console already stop!"
    fi
}

show_log(){
    tail -f sqlite-console.out
}

show_help(){
    echo -e "\r\n\t欢迎使用sqlite-console Blog"
    echo -e "\r\nUsage: sh sqlite-console.sh start|stop|reload|status|log"
    exit
}

show_status(){
    pid=$(get_pid)
    if [ "$pid" != "" ]
    then
        echo "sqlite-console is running with pid: $pid"
    else
        echo "sqlite-console is stop!"
    fi
}

if [ $arglen -eq 0 ]
 then
    show_help
else
    if [ "$2" != "" ]
    then
        env_args="$2"
    fi
    case "$1" in
        "start")
            startup "$env_args"
            ;;
        "stop")
            shut_down
            ;;
        "reload")
            echo "reload"
            ;;
        "status")
            show_status
            ;;
        "log")
            show_log
            ;;
    esac
fi