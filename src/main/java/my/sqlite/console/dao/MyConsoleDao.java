package my.sqlite.console.dao;

import my.sqlite.console.SqliteConsoleBaseDao;
import my.sqlite.console.entity.MyConsole;

public class MyConsoleDao extends SqliteConsoleBaseDao {
    public MyConsoleDao(String dbPath, boolean absolute) {
        super(dbPath, absolute);
    }

    public MyConsoleDao(String dbPath) {
        super(dbPath);
    }
}
