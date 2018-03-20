package my.sqlite.console.config;

import my.sqlite.console.utils.SqliteConloseUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Created by vetech on 2017/8/31.
 */
public class PassworMd5 implements PasswordEncoder {


    @Override
    public String encode(CharSequence rawPassword) {
        final int md5Len = 32;
        String password = rawPassword.toString();
        if (password.length() == md5Len) {
            return password;
        }
        return SqliteConloseUtils.md5(password);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String password = encode(rawPassword);
        return password.equalsIgnoreCase(encodedPassword);
    }
}
