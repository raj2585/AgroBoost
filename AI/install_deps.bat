@echo off
echo Installing AgroBoost AI dependencies...

echo Upgrading pip...
pip install --upgrade pip

echo Installing required packages...
pip install -r requirements.txt --force-reinstall

echo Installing accelerate specifically...
pip install accelerate==0.26.1 --force-reinstall

echo Installation complete!
echo Run debug_model.py to test model loading.
