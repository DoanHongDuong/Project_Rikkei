import { Card, Select, Typography, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div>
      <Title level={2}>{t('page.settings.title')}</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>{t('page.settings.language')}</Text>
              <Select
                value={i18n.language || 'vi'}
                style={{ width: 200 }}
                onChange={handleLanguageChange}
                options={[
                  { value: 'vi', label: t('page.settings.vietnamese') },
                  { value: 'en', label: t('page.settings.english') }
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
