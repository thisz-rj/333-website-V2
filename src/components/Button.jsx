export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}) {
  const classes = ['button', `button-${variant}`, `button-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} type={type} {...props} />;
}
