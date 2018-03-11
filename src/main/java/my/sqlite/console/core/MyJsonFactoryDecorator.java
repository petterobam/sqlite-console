package my.sqlite.console.core;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.MappingJsonFactory;
import net.logstash.logback.decorate.JsonFactoryDecorator;

/**
 * Created by vetech on 2017/9/7.
 * @author houya
 */
public class MyJsonFactoryDecorator implements JsonFactoryDecorator {

    @Override
    public MappingJsonFactory decorate(MappingJsonFactory factory) {
        // 禁用对非ascii码进行escape编码的特性
        factory.disable(JsonGenerator.Feature.ESCAPE_NON_ASCII);
        return factory;
    }

}