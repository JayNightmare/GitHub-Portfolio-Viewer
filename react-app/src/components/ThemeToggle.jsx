import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <ButtonGroup className="mb-3">
      <Button
        variant={theme === 'light' ? 'primary' : 'outline-primary'}
        onClick={() => setTheme('light')}
      >
        Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : 'outline-primary'}
        onClick={() => setTheme('dark')}
      >
        Dark
      </Button>
    </ButtonGroup>
  );
}
