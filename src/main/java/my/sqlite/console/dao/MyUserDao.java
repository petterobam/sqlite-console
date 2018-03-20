package my.sqlite.console.dao;

import my.sqlite.base.SqliteBaseDao;
import my.sqlite.console.entity.MyUser;

public class MyUserDao extends SqliteBaseDao<MyUser> {
    public MyUserDao() {
        super(MyUser.class);
    }

}
