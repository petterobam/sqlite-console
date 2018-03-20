package my.sqlite.console.entity;

import my.sqlite.annotation.SqliteColumn;
import my.sqlite.annotation.SqliteID;
import my.sqlite.annotation.SqliteTable;
import my.sqlite.annotation.SqliteTransient;
import my.sqlite.base.SqliteBaseEntity;
import my.sqlite.console.utils.SqliteConloseUtils;
import org.springframework.util.DigestUtils;

@SqliteTable(name = "t_user", dbPath = "database/admin.db")
public class MyUser extends SqliteBaseEntity {
    @SqliteID
    private String uid;
    @SqliteColumn(type = "char(10)", notNull = true)
    private String name;
    @SqliteColumn(type = "char(32)", notNull = true)
    private String password;
    @SqliteColumn(name = "create_time", type = "char(20)", notNull = true)
    private String createTime;
    @SqliteTransient
    private String verifyCode;

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setMD5Password(String password) {
        this.password = SqliteConloseUtils.md5(password);
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }
}
