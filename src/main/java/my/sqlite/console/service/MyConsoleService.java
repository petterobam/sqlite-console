package my.sqlite.console.service;

import my.sqlite.console.SqliteConsoleBaseEntity;
import my.sqlite.console.SqliteConsoleBaseService;
import my.sqlite.console.entity.MyConsole;
import my.sqlite.console.utils.SqliteConloseUtils;
import my.sqlite.utils.SqliteUtils;

import java.util.List;

public class MyConsoleService extends SqliteConsoleBaseService {
    public MyConsoleService(String dbPath, boolean absolute) {
        super(dbPath, absolute);
    }

    public MyConsoleService(String dbPath) {
        super(dbPath);
    }

    public MyConsoleService(MyConsole entity) {
        super(entity.getDbPath(),entity.getAbsolute());
    }

    /**
     * 执行SQL语句
     * @param myConsole
     */
    public void excute(MyConsole myConsole) {
        SqliteConsoleBaseEntity result = super.excute(myConsole.getSql());
        myConsole.copyProperties(result);
    }

    /**
     * 获取数据库集
     * @param myConsole
     * @return
     */
    public List<String> getDbs(MyConsole myConsole){
        String path = myConsole.getDbPath();
        Boolean absoult = myConsole.getAbsolute();
        return SqliteConloseUtils.getSqliteDbNames(absoult,path);
    }
    /**
     * 获取数据库表名集合
     * @return
     */
    public String[] getTableNameArr(){
        return super.getTableNameArr();
    }
}
