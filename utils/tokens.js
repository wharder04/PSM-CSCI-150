const jwt = require('jsonwebtoken');

function signJwt(payload, expiresIn) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

function setAuthCookie(res, token, remember=false) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd && process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: remember ? 30*24*60*60*1000 : 2*60*60*1000 // 30d vs 2h
  });
}

function clearAuthCookie(res) {
  res.clearCookie(process.env.COOKIE_NAME, { path: '/' });
}

module.exports = { signJwt, setAuthCookie, clearAuthCookie };
