#!/bin/bash
# author:petterobam
# url:https://github.com/petterobam/my-sqlite-console


# Usage: sh my-sqlite-console.sh start "-Xms128m -Xmx128m"
# Usage: sh my-sqlite-console.sh stop
# Usage: sh my-sqlite-console.sh status
# Usage: sh my-sqlite-console.sh reload 10
# Usage: sh my-sqlite-console.sh log

env_args="-Xms128m -Xmx128m"
sleeptime=0
arglen=$#

# get my-sqlite-console pid
get_pid(){
    pname="`find .. -name 'my-sqlite-console*.jar'`"
    pname=${pname:3}
    pid=`ps -ef | grep $pname | grep -v grep | awk '{print $2}'`
    echo "$pid"
}

startup(){
    pid=$(get_pid)
    if [ "$pid" != "" ]
    then
        echo "my-sqlite-console already startup!"
    else
        jar_path=`find .. -name 'my-sqlite-console*.jar'`
        echo "jarfile=$jar_path"
        cmd="java $1 -jar $jar_path > ./my-sqlite-console.out < /dev/null &"
        echo "cmd: $cmd"
        java $1 -jar $jar_path > ./my-sqlite-console.out < /dev/null &
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
        echo "my-sqlite-console is stop!"
    else
        echo "my-sqlite-console already stop!"
    fi
}

show_log(){
    tail -f my-sqlite-console.out
}

show_help(){
    echo -e "\r\n\t欢迎使用my-sqlite-console Blog"
    echo -e "\r\nUsage: sh my-sqlite-console.sh start|stop|reload|status|log"
    exit
}

show_status(){
    pid=$(get_pid)
    if [ "$pid" != "" ]
    then
        echo "my-sqlite-console is running with pid: $pid"
    else
        echo "my-sqlite-console is stop!"
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