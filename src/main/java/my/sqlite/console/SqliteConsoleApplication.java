package my.sqlite.console;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import java.util.Arrays;

/**
 * 应用启动
 *
 * @author houya
 */
@SpringBootApplication
@ComponentScan(basePackages = {"my.sqlite.console"})
public class SqliteConsoleApplication {
    /**
     * 日志工具
     */
    private Logger logger = LoggerFactory.getLogger(SqliteConsoleApplication.class);

    /**
     * 主程序
     *
     * @param args 构造函数
     */
    public static void main(String[] args) {
        SpringApplication.run(SqliteConsoleApplication.class, args);
    }

    /**
     * 控制台打印服务类名
     *
     * @param ctx 上下文
     * @return 执行命名行
     */
    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {
            logger.info("[sqlite-console] Spring boot 服务");
            String[] beanNames = ctx.getBeanDefinitionNames();
            Arrays.sort(beanNames);
            for (String beanName : beanNames) {
                logger.debug(beanName);
            }
        };
    }
}
