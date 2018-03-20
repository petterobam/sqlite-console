package admin;

import my.sqlite.console.entity.MyUser;
import my.sqlite.console.service.MyUserService;
import my.sqlite.utils.SqliteUtils;
import org.junit.Test;

public class MyUserTest {
    @Test
    public void addDefaultUser() {
        MyUserService service = new MyUserService();
        MyUser entity = new MyUser();
        entity.setName("admin");
        entity.setMD5Password("admin");
        entity.setCreateTime(SqliteUtils.getStringDate());
        service.insert(entity);

        service.query(new MyUser());
    }
}
