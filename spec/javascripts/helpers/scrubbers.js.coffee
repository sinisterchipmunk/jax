# scrub before and after to remove real application state, if any
for each in [beforeEach, afterEach]
  each ->
    Jax.Dev.Views.ColorPicker.scrub()
    Jax.Dev.Views.Drawer.scrub()
