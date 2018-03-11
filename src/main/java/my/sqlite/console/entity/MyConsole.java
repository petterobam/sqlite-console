package my.sqlite.console.entity;

import my.sqlite.base.SqliteBaseEntity;
import my.sqlite.console.SqliteConsoleBaseEntity;

public class MyConsole extends SqliteConsoleBaseEntity {
    /**
     * Sql语句
     */
    private String sql;
    /**
     * 数据库路径
     */
    private String dbPath;
    /**
     * 是否绝对路径
     */
    private Boolean absolute = false;

    public String getSql() {
        return sql;
    }

    public void setSql(String sql) {
        this.sql = sql;
    }

    public String getDbPath() {
        return dbPath;
    }

    public void setDbPath(String dbPath) {
        this.dbPath = dbPath;
    }

    public Boolean getAbsolute() {
        return absolute;
    }

    public void setAbsolute(Boolean absolute) {
        this.absolute = absolute;
    }

    public void copyProperties(SqliteConsoleBaseEntity entity){
        this.setInfactLine(entity.getInfactLine());
        this.setQueryResult(entity.getQueryResult());
        this.setHasException(entity.isHasException());
        this.setSqlException(entity.getSqlException());
        this.setException(entity.getException());
        this.setCmdResult(entity.getCmdResult());
    }
}
